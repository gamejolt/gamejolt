import { markRaw, reactive } from 'vue';
import { arrayRemove, numberSort } from '../../../utils/array';
import { createLogger } from '../../../utils/logging';
import { storeModel, storeModelList } from '../../../_common/model/model-store.service';
import { commonStore } from '../../../_common/store/common-store';
import { EventTopic } from '../../../_common/system/event/event-topic';
import { AppStore } from '../../store';
import { type GridClient } from '../grid/client.service';
import { ChatMessage, ChatMessageType } from './message';
import { ChatRoom } from './room';
import { ChatRoomChannel, createChatRoomChannel } from './room-channel';
import { ChatUser } from './user';
import { ChatUserChannel, createChatUserChannel } from './user-channel';
import { ChatUserCollection } from './user-collection';

export const ChatKey = Symbol('chat');

export const onNewChatMessage = new EventTopic<ChatMessage>();

export interface ChatNewMessageEvent {
	message: ChatMessage;
}

export function createChatClient({ grid, appStore }: { grid: GridClient; appStore: AppStore }) {
	// Don't want to unwrap the refs from the app store.
	const client = reactive(
		new ChatClient(markRaw(grid), markRaw(appStore))
	) as unknown as ChatClient;

	// Set it up fresh.
	clearChat(client);
	return client;
}

export class ChatClient {
	constructor(private readonly grid: GridClient, public readonly appStore: AppStore) {}

	readonly logger = createLogger('Chat');

	// Will get created in "init".
	isGuest = false;
	userChannel: ChatUserChannel | null = null;

	/**
	 * Whether or not the user's chat data is populated (friends, chats, etc.)
	 */
	populated = false;
	currentUser: ChatUser | null = null;
	friendsList: ChatUserCollection = null as any;
	groupRooms: ChatRoom[] = [];

	room: ChatRoom | null = null;

	/**
	 * Used to check which room is currently being polled.
	 * We are only allowing polling of one room simultaneously
	 */
	pollingRoomId = -1;

	// The following are indexed by room ID.
	roomChannels: { [k: string]: ChatRoomChannel } = {};
	notifications: { [k: string]: number } = {};
	isFocused = true;

	messageEditing: null | ChatMessage = null;

	/**
	 * If set, will connect as a guest, using this token.
	 */
	guestToken: string | null = null;

	get socketController() {
		return this.grid.socketController;
	}

	/**
	 * Chat is connected when grid is connected. This if for convenience.
	 */
	get connected() {
		return this.grid.connected;
	}

	/**
	 * The session room is stored within their local session. It's their last active room. We reopen
	 * it when entering the chat again.
	 */
	get sessionRoomId(): number | undefined {
		const roomId = sessionStorage.getItem('chat:room');
		return roomId ? parseInt(roomId, 10) : undefined;
	}

	set sessionRoomId(roomId: number | undefined) {
		if (!roomId) {
			sessionStorage.removeItem('chat:room');
		} else {
			sessionStorage.setItem('chat:room', roomId + '');
		}
	}

	get roomNotificationsCount() {
		return Object.values(this.notifications).reduce((total, roomCount) => total + roomCount, 0);
	}
}

export function clearChat(chat: ChatClient) {
	chat.currentUser = null;
	chat.friendsList = new ChatUserCollection(chat, ChatUserCollection.TYPE_FRIEND, []);
	chat.populated = false;
	chat.pollingRoomId = -1;

	chat.room = null;
	chat.groupRooms = [];

	chat.notifications = {};
	chat.isFocused = true;

	chat.userChannel = null;
	chat.roomChannels = {};
}

export async function connectChat(chat: ChatClient) {
	const { user } = commonStore;

	setChatRoom(chat, undefined);

	if (user.value) {
		const channel = await createChatUserChannel(chat, { userId: user.value.id });

		chat.userChannel = channel;
		chat.populated = true;
	}
}

async function joinRoomChannel(chat: ChatClient, roomId: number) {
	if (chat.pollingRoomId === roomId) {
		chat.logger.info('Do not attempt to join the same room twice.', roomId);
		return;
	}

	return await createChatRoomChannel(chat, { roomId, instanced: false });
}

/**
 * Called by the chat room channel to set itself up fully after joining.
 */
export function setupChatRoom(chat: ChatClient, room: ChatRoom, messages: ChatMessage[]) {
	if (isRoomInstanced(chat, room.id) || !isInChatRoom(chat, room.id)) {
		// Only set the room as "the" active room when it's not instanced.
		if (!isRoomInstanced(chat, room.id)) {
			setChatRoom(chat, room);
		}

		// Clear out any old messages so we don't use old data from the model
		// store.
		room.messages = [];
		processNewChatOutput(room, messages, true);
	}
}

export function setChatRoom(chat: ChatClient, newRoom: ChatRoom | undefined) {
	leaveChatRoom(chat);

	if (newRoom) {
		if (chat.currentUser && chat.isFocused) {
			chat.roomChannels[newRoom.id].pushFocus();
		}

		chat.sessionRoomId = newRoom.id;
	}

	chat.room = newRoom || null;
}

/**
 * Call this to open a room. It'll do the correct thing to either open the chat
 * if closed, or enter the room.
 */
export function enterChatRoom(chat: ChatClient, roomId: number) {
	if (isInChatRoom(chat, roomId)) {
		return;
	}

	const { visibleLeftPane, toggleChatPane } = chat.appStore;

	// If the chat isn't visible yet, set the session room to this new room and
	// open it. That will in turn do the entry. Otherwise we want to just switch
	// rooms.
	if (visibleLeftPane.value !== 'chat') {
		chat.sessionRoomId = roomId;
		toggleChatPane();
	} else {
		joinRoomChannel(chat, roomId);
	}
}

export function leaveChatRoom(chat: ChatClient, room: ChatRoom | null = null) {
	if (chat.messageEditing) {
		setMessageEditing(chat, null);
	}

	if (room === null) {
		room = chat.room;
	}

	if (!room) {
		return;
	}

	const channel = chat.roomChannels[room.id];
	if (channel) {
		stopTyping(chat, room);
		delete chat.roomChannels[room.id];
		channel.channelController.leave();
		chat.pollingRoomId = -1;
	}
}

export function isChatFocusedOnRoom(chat: ChatClient, roomId: number) {
	return isInChatRoom(chat, roomId) && chat.isFocused;
}

export function setChatFocused(chat: ChatClient, focused: boolean) {
	chat.isFocused = focused;

	if (!chat.currentUser) {
		return;
	}

	// Update focused for current room.
	if (chat.room) {
		if (chat.isFocused) {
			chat.roomChannels[chat.room.id].pushFocus();
		} else {
			chat.roomChannels[chat.room.id].pushUnfocus();
		}
	}

	// Update focused for all instanced rooms.
	for (const roomId in chat.roomChannels) {
		if (!chat.roomChannels[roomId]) {
			continue;
		}

		const roomChannel = chat.roomChannels[roomId];
		if (!roomChannel.instanced) {
			continue;
		}

		const channelRoomId = roomChannel.roomId;
		if (chat.isFocused) {
			chat.roomChannels[channelRoomId].pushFocus();
		} else {
			chat.roomChannels[channelRoomId].pushUnfocus();
		}
	}
}

export function newChatNotification(chat: ChatClient, roomId: number) {
	// Don't shows if they're focused in the room.
	if (isChatFocusedOnRoom(chat, roomId)) {
		return;
	}

	// Only store for non-instanced channels.
	if (isRoomInstanced(chat, roomId)) {
		return;
	}

	if (chat.notifications[roomId]) {
		++chat.notifications[roomId];
	} else {
		chat.notifications[roomId] = 1;
	}
}

export function queueChatMessage(room: ChatRoom, type: ChatMessageType, content: string) {
	const { chat } = room;

	if (chat.currentUser === null) {
		return;
	}

	const tempId = Math.floor(Math.random() * Date.now());
	const message = storeModel(ChatMessage, {
		id: tempId,
		user_id: chat.currentUser.id,
		user: chat.currentUser,
		room_id: room.id,
		type,
		content,
		logged_on: Date.now(),
		_isQueued: true,
	});

	room.queuedMessages.push(message);
	setTimeSplit(room, message);
	sendChatMessage(room, message);
}

export function setTimeSplit(room: ChatRoom, message: ChatMessage) {
	message.showAvatar = false;
	message.showMeta = true;
	message.dateSplit = false;

	const combineTimeCheck = 5 * 60 * 1000;
	let messages = room.messages;

	// For queued messages, we also factor in the other queued messages.
	if (message._isQueued) {
		messages = messages.concat(room.queuedMessages);
	}

	// Find the message preceeding this one.
	// If we can't locate the message in the list, we assume it's not in the list yet and about to be added to the end.
	// Therefore, we use the last message in the list as previous and pretend this message is at the end of the list.
	const messageIndex = messages.findIndex(i => i.id === message.id);
	let prevMessage: ChatMessage | null = null;

	if (messageIndex > 0) {
		prevMessage = messages[messageIndex - 1];
		const nextMessage =
			messageIndex === messages.length - 1 ? null : messages[messageIndex + 1];

		const isPrevSameUser = message.user.id === prevMessage.user.id;
		const isNextSameUser = !!nextMessage && nextMessage.user.id === message.user.id;
		const isWithinTime =
			message.logged_on.getTime() - prevMessage.logged_on.getTime() <= combineTimeCheck;

		message.showAvatar = !nextMessage || isPrevSameUser || !isNextSameUser;

		if (isPrevSameUser && isWithinTime) {
			message.showMeta = false;
		}

		// If the date is different than the date for the previous
		// message, we want to split it in the view.
		const curDate = message.logged_on;
		const prevDate = prevMessage.logged_on;
		if (
			curDate.getFullYear() !== prevDate.getFullYear() ||
			curDate.getMonth() !== prevDate.getMonth() ||
			curDate.getDate() !== prevDate.getDate()
		) {
			message.dateSplit = true;
			message.showAvatar = true;
			message.showMeta = true;
		}
	} else {
		// First message should show date.
		message.dateSplit = true;
		message.showAvatar = true;
	}

	if (!message.showMeta && prevMessage) {
		prevMessage.showAvatar = false;
	}
}

function outputMessage(room: ChatRoom, message: ChatMessage, isHistorical: boolean) {
	const isInstanced = isRoomInstanced(room.chat, room.id);
	if (!isInstanced && (!room || !isInChatRoom(room.chat, room.id))) {
		return;
	}

	message.logged_on = new Date(message.logged_on);
	room.messages.push(message);
	setTimeSplit(room, message);

	if (!isHistorical) {
		if (isInstanced || !room.isPrivateRoom) {
			newChatNotification(room.chat, room.id);
		}
	}
}

export function processNewChatOutput(
	room: ChatRoom,
	messages: ChatMessage[],
	isHistorical: boolean
) {
	if (!messages.length) {
		return;
	}

	messages.forEach(message => {
		outputMessage(room, message, isHistorical);

		if (!isHistorical) {
			// Emit an event that we've sent out a new message.
			onNewChatMessage.next(message);
		}
	});

	// After we received and output the message(s), update the time split for
	// queued messages.
	room.queuedMessages.forEach(i => setTimeSplit(room, i));
}

async function sendChatMessage(room: ChatRoom, message: ChatMessage) {
	const roomChannel = room.chat.roomChannels[room.id];
	if (!roomChannel) {
		return;
	}

	message._error = false;
	message._isProcessing = true;

	try {
		const data = await roomChannel.pushMessage(message.content);

		// Upon receiving confirmation from the server, remove the message from
		// the queue and add the received message to the list.
		//
		// We do this here because we display the queued message in the window
		// until we wait for this confirmation. We have to do this swap at the
		// same time so it seems like the message gets replaced seamlessly,
		// instead of having a very slight (but noticable) delay between adding
		// the new message and removing the queued one.
		arrayRemove(room.queuedMessages, i => i.id === message.id);

		const newMessage = storeModel(ChatMessage, data);
		roomChannel.processNewRoomMessage(newMessage);
	} catch (e) {
		room.chat.logger.error('Received error sending message', e);
		message._error = true;
		message._isProcessing = false;
	}
}

function isRoomInstanced(chat: ChatClient, roomId: number) {
	const channel = chat.roomChannels[roomId];
	if (!channel) {
		return false;
	}

	return channel.instanced;
}

/** Set the message that is currently being edited, or 'null' to clear the state. */
export function setMessageEditing(chat: ChatClient, message: ChatMessage | null) {
	chat.messageEditing = message;
}

export function retryFailedQueuedMessage(room: ChatRoom, message: ChatMessage) {
	if (!message._isQueued || !message._error) {
		return;
	}

	// Set the date, and then resort everything so it shows as the latest message.
	message.logged_on = new Date();
	room.queuedMessages.sort((a, b) => numberSort(a.logged_on.getTime(), b.logged_on.getTime()));
	room.queuedMessages.forEach(i => setTimeSplit(room, i));

	// Now we try to send again.
	sendChatMessage(room, message);
}

export async function loadOlderChatMessages(room: ChatRoom) {
	const { chat } = room;

	try {
		const firstMessage = room.messages[0];
		const data = await chat.roomChannels[room.id].pushLoadMessages(firstMessage.logged_on);

		const oldMessages = storeModelList(ChatMessage, data.messages);

		// If no older messages, we reached the end of the history.
		if (oldMessages.length > 0) {
			const messages = [...oldMessages.reverse(), ...room.messages];

			// We have to clear out all messages and add them again so that we
			// calculate proper date splits and what not.
			room.messages = [];
			processNewChatOutput(room, messages, true);
		}
	} catch {
		throw new Error(`Failed to load messages.`);
	}
}

/**
 * Will return null if the user is not their friend.
 */
export function isUserOnline(chat: ChatClient, userId: number): null | boolean {
	if (chat.currentUser?.id === userId) {
		return true;
	}

	return chat.friendsList.get(userId)?.isOnline ?? null;
}

export async function addGroupRoom(chat: ChatClient, members: number[]) {
	if (!chat.userChannel) {
		return;
	}

	const response = await chat.userChannel.pushGroupAdd(members);
	const newGroupRoom = storeModel(ChatRoom, { chat, ...response.room });
	chat.groupRooms.push(newGroupRoom);
	enterChatRoom(chat, newGroupRoom.id);
}

export function addGroupMembers(chat: ChatClient, roomId: number, members: number[]) {
	return chat.roomChannels[roomId].pushMemberAdd(members);
}

export async function leaveGroupRoom(chat: ChatClient, room: ChatRoom) {
	if (!chat.userChannel) {
		return;
	}

	if (!room.isGroupRoom) {
		throw new Error(`Can't leave non-group rooms.`);
	}

	await chat.userChannel.pushGroupLeave(room.id);
}

export function removeMessage(chat: ChatClient, room: ChatRoom, messageId: number) {
	return chat.roomChannels[room.id].pushMessageRemove(messageId);
}

export function editMessage(
	chat: ChatClient,
	room: ChatRoom,
	{ content, id }: { content: string; id: number }
) {
	return chat.roomChannels[room.id].pushMessageUpdate(id, content);
}

export function editChatRoomTitle(chat: ChatClient, room: ChatRoom, title: string) {
	return chat.roomChannels[room.id].pushUpdateTitle(title);
}

export function editChatRoomBackground(
	chat: ChatClient,
	room: ChatRoom,
	backgroundId: number | null
) {
	return chat.roomChannels[room.id].pushUpdateBackground(backgroundId);
}

export function startTyping(chat: ChatClient, room: ChatRoom) {
	return chat.roomChannels[room.id].pushStartTyping();
}

export function stopTyping(chat: ChatClient, room: ChatRoom) {
	return chat.roomChannels[room.id].pushStopTyping();
}

export function isInChatRoom(chat: ChatClient, roomId?: number) {
	// When no room id is passed in, just check if the user is in any room.
	if (!roomId) {
		return !!chat.room;
	}

	// Instanced rooms are always active, and the user is in all instanced rooms.
	if (isRoomInstanced(chat, roomId)) {
		return true;
	}

	return chat.room ? chat.room.id === roomId : false;
}

export function updateChatRoomLastMessageOn(chat: ChatClient, message: ChatMessage) {
	const time = message.logged_on.getTime();

	// If it's a friend chat.
	const friend = chat.friendsList.getByRoom(message.room_id);
	if (friend) {
		friend.last_message_on = time;
		chat.friendsList.updated(friend);
	}

	// If it's a group chat.
	const groupRoom = chat.groupRooms.find(i => i.id === message.room_id);
	if (groupRoom) {
		groupRoom.last_message_on = time;
	}

	if (friend || groupRoom) {
		return;
	}

	// Firesides aren't part of friends list or group rooms. If we didn't find a
	// matching room yet, try finding it here and assigning the timestamp data.
	const roomChannel = chat.roomChannels[message.room_id];
	if (roomChannel) {
		roomChannel.room.value.last_message_on = time;
	}
}

export function kickGroupMember(chat: ChatClient, room: ChatRoom, memberId: number) {
	return chat.roomChannels[room.id].pushKickMember(memberId);
}

/**
 * Called when something internal changes that would require us to resort our
 * member arrays.
 *
 * For example, if a friend goes online/offline, we resort the room member lists
 * to reflect that status.
 */
export function recollectChatRoomMembers(chat: ChatClient) {
	for (const room of chat.groupRooms) {
		room.memberCollection.recollect();
	}
}

/**
 * Attempts to get the role for a user in a room.
 * This is only possible if the role is bootstrapped onto the input user,
 * or if the user is currently in the room.
 */
export function tryGetRoomRole(room: ChatRoom, user: ChatUser) {
	if (room.owner_id === user.id) {
		return 'owner';
	}

	// The role should be set on the room.
	const roomRole = room.roles.find(i => i.user_id === user.id);
	if (roomRole && roomRole.role) {
		return roomRole.role;
	}

	// We try to fall back to the input role.
	// This could be from a message from a user no longer in the room.
	if (user.role !== null) {
		return user.role;
	}

	// If no role could be found, just return user.
	return 'user';
}

/**
 * Returns whether `user` can moderate `otherUser` within the given `room`.
 */
export function userCanModerateOtherUser(room: ChatRoom, user: ChatUser, otherUser: ChatUser) {
	// Cannot moderate yourself.
	if (user.id === otherUser.id) {
		return false;
	}

	const userRole = tryGetRoomRole(room, user);
	const otherUserRole = tryGetRoomRole(room, otherUser);

	// Owners can always moderate.
	if (userRole === 'owner') {
		return true;
	}

	// Normal users cannot moderate.
	if (userRole === null || userRole === 'user') {
		return false;
	}

	// Mods can only moderate users.
	if (otherUserRole !== 'user') {
		return false;
	}

	return userRole === 'moderator';
}
