import Axios from 'axios';
import { Channel, Socket } from 'phoenix';
import Vue from 'vue';
import { EventBus } from '../../../system/event/event-bus.service';
import { arrayRemove, numberSort } from '../../../utils/array';
import { sleep } from '../../../utils/utils';
import { getCookie } from '../../../_common/cookie/cookie.service';
import { Environment } from '../../../_common/environment/environment.service';
import { store } from '../../store';
import { ChatMessage, ChatMessageType } from './message';
import { ChatRoom } from './room';
import { ChatRoomChannel } from './room-channel';
import { ChatUser } from './user';
import { ChatUserChannel } from './user-channel';
import { ChatUserCollection } from './user-collection';

export const ChatKey = Symbol('Chat');

export interface ChatNewMessageEvent {
	message: ChatMessage;
}

/**
 * Polls a request until it returns a result, increases the delay time between
 * requests after each failed attempt.
 *
 * @param context Context for logging
 * @param requestGetter Function that generates a promise that represents the
 * request
 */
async function pollRequest(
	chat: ChatClient,
	context: string,
	requestGetter: () => Promise<any>
): Promise<any> {
	const chatId = chat.id;

	let result = null;
	let finished = false;
	let delay = 0;

	console.log(`[Chat] ${context}`);

	while (!finished) {
		// Abort if our chat server changed.
		if (chat.id !== chatId) {
			return null;
		}

		try {
			const promise = requestGetter();
			result = await promise;
			finished = true;
		} catch (e) {
			const sleepMs = Math.min(30000, Math.random() * delay * 1000 + 1000);
			console.error(`[Chat] Failed request [${context}]. Reattempt in ${sleepMs} ms.`);
			await sleep(sleepMs);
		}

		delay++;
	}

	return result;
}

export class ChatClient {
	static nextId = 1;

	id = -1;
	connected = false;
	socket: Socket | null = null;
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
	messages: { [k: string]: ChatMessage[] } = {};
	usersOnline: { [k: string]: ChatUserCollection } = {};
	roomMembers: { [k: string]: ChatUserCollection } = {};
	notifications: { [k: string]: number } = {};
	isFocused = true;

	messageQueue: ChatMessage[] = [];
	messageEditing: null | ChatMessage = null;

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
		let count = 0;
		for (const val of Object.values(this.notifications)) {
			count += val || 0;
		}
		return count;
	}

	constructor() {
		reset(this);
		connect(this);
	}
}

function reset(chat: ChatClient) {
	chat.id = -1;
	chat.connected = false;
	chat.currentUser = null;
	chat.friendsList = new ChatUserCollection(ChatUserCollection.TYPE_FRIEND);
	chat.populated = false;
	chat.pollingRoomId = -1;

	chat.room = null;

	// The following are indexed by roomId
	chat.messages = {};
	chat.usersOnline = {};
	chat.roomMembers = {};
	chat.notifications = {};
	chat.isFocused = true;

	chat.messageQueue = [];
}

function reconnect(chat: ChatClient) {
	destroy(chat);
	connect(chat);
}

async function connect(chat: ChatClient) {
	const chatId = ChatClient.nextId++;
	chat.id = chatId;

	const frontend = await getCookie('frontend');
	const user = store.state.app.user;
	const timedOut = store.state.app.isUserTimedOut;

	if (user === null || frontend === undefined || timedOut) {
		// Not properly logged in.
		return;
	}

	console.log('[Chat] Connecting...');

	const [hostResult, tokenResult] = await pollRequest(chat, 'Auth to server', () => {
		return Promise.all([
			Axios.get(`${Environment.chat}/host`, { ignoreLoadingBar: true, timeout: 3000 }),
			Axios.post(
				`${Environment.chat}/token`,
				{ frontend },
				{ ignoreLoadingBar: true, timeout: 3000 }
			),
		]);
	});

	if (chatId !== chat.id) {
		return;
	}

	const host = `${hostResult.data}`;
	const token = tokenResult.data.token;

	console.log('[Chat] Server selected:', host);

	// heartbeat is 30 seconds, backend disconnects after 40 seconds
	chat.socket = new Socket(host, {
		heartbeatIntervalMs: 30000,
		params: { token },
	});

	// HACK
	// there is no built in way to stop a Phoenix socket from attempting to reconnect on its own after it got disconnected.
	// this replaces the socket's "reconnectTimer" property with an empty object that matches the Phoenix "Timer" signature
	// The 'reconnectTimer' usually restarts the connection after a delay, this prevents that from happening
	const socketAny: any = chat.socket;
	if (Object.prototype.hasOwnProperty.call(socketAny, 'reconnectTimer')) {
		socketAny.reconnectTimer = { scheduleTimeout: () => {}, reset: () => {} };
	}

	chat.socket.onOpen(() => {
		chat.connected = true;
		setChatRoom(chat, undefined);
	});

	chat.socket.onError((e: any) => {
		console.warn('[Chat] Got error from socket');
		console.warn(e);
		reconnect(chat);
	});

	chat.socket.onClose(() => {
		console.warn('[Chat] Socket closed unexpectedly');
		reconnect(chat);
	});

	await pollRequest(
		chat,
		'Connect to socket',
		() =>
			new Promise(resolve => {
				if (chat.socket !== null) {
					chat.socket.connect();
				}
				resolve();
			})
	);

	if (chatId !== chat.id) {
		return;
	}

	joinUserChannel(chat, user.id);
}

export function destroy(chat: ChatClient) {
	console.log('[Chat] Destroying client');

	if (!chat.connected) {
		return;
	}

	reset(chat);

	if (chat.userChannel) {
		leaveChannel(chat, chat.userChannel);
		chat.userChannel = null;
	}

	Object.keys(chat.roomChannels).forEach(roomId => {
		leaveChannel(chat, chat.roomChannels[roomId]);
	});
	chat.roomChannels = {};

	if (chat.socket) {
		console.log('[Chat] Disconnecting socket');
		// TODO(chatex) might need to dispose of socket only after it is fully disconnected.
		chat.socket.disconnect();
		chat.socket = null;
	}
}

async function joinUserChannel(chat: ChatClient, userId: number) {
	const channel = new ChatUserChannel(userId, chat);
	const request = `Join user channel ${userId}`;

	await pollRequest(
		chat,
		request,
		() =>
			new Promise((resolve, reject) => {
				channel
					.join()
					.receive('error', reject)
					.receive('ok', response => {
						const currentUser = new ChatUser(response.user);
						const friendsList = new ChatUserCollection(
							ChatUserCollection.TYPE_FRIEND,
							response.friends || []
						);
						chat.userChannel = channel;
						chat.currentUser = currentUser;
						chat.friendsList = friendsList;
						chat.notifications = response.notifications;
						chat.groupRooms = response.groups.map(
							(room: ChatRoom) => new ChatRoom(room)
						);
						chat.populated = true;
						resolve();
					});
			})
	);
}

async function joinRoomChannel(chat: ChatClient, roomId: number) {
	const channel = new ChatRoomChannel(roomId, chat);

	if (chat.pollingRoomId === roomId) {
		console.log('[Chat] Do not attempt to join the same room twice.', roomId);
		return;
	}

	chat.pollingRoomId = roomId;

	await pollRequest(
		chat,
		`Join room channel: ${roomId}`,
		() =>
			new Promise((resolve, reject) => {
				// If the client started polling a different room, stop polling this one.
				if (chat.pollingRoomId !== roomId) {
					console.log('[Chat] Stop joining room', roomId);
					resolve();
				}

				channel
					.join()
					.receive('error', reject)
					.receive('ok', response => {
						chat.pollingRoomId = -1;
						chat.roomChannels[roomId] = channel;
						channel.room = new ChatRoom(response.room);
						const messages = response.messages.map(
							(msg: ChatMessage) => new ChatMessage(msg)
						);
						messages.reverse();
						setupRoom(chat, channel.room, messages);
						resolve();
					});
			})
	);
}

export function setChatRoom(chat: ChatClient, newRoom: ChatRoom | undefined) {
	// In single-room mode, if there is a currently active room, we always want
	// to clear it out. Whether we're setting to null or a new room.
	leaveChatRoom(chat);

	if (newRoom) {
		if (chat.currentUser) {
			chat.roomChannels[newRoom.id].push('focus', { roomId: newRoom.id });
		}

		if (newRoom.isGroupRoom) {
			Vue.delete(chat.notifications, '' + newRoom.id);
		}

		chat.sessionRoomId = newRoom.id;
	}

	chat.room = newRoom || null;
}

export function newChatNotification(chat: ChatClient, roomId: number) {
	if (isInChatRoom(chat, roomId) && chat.isFocused) {
		return;
	}

	if (chat.notifications[roomId]) {
		chat.notifications[roomId] = chat.notifications[roomId] + 1;
	} else {
		Vue.set(chat.notifications, '' + roomId, 1);
	}
}

/**
 * Call this to open a room. It'll do the correct thing to either open the chat if closed, or
 * enter the room.
 */
export function enterChatRoom(chat: ChatClient, roomId: number) {
	if (isInChatRoom(chat, roomId)) {
		return;
	}

	// If the chat isn't visible yet, set the session room to this new room and open it. That
	// will in turn do the entry. Otherwise we want to just switch rooms.
	if (store.state.visibleLeftPane !== 'chat') {
		chat.sessionRoomId = roomId;
		store.dispatch('toggleChatPane');
	} else {
		if (!chat.socket) {
			return;
		}

		joinRoomChannel(chat, roomId);
	}
}

function leaveChannel(chat: ChatClient, channel: Channel) {
	// TODO(chatex) might need to await this.
	channel.leave();
	if (chat.socket !== null) {
		chat.socket.remove(channel);
	}
}

export function leaveChatRoom(chat: ChatClient) {
	if (chat.messageEditing) {
		setMessageEditing(chat, null);
	}

	if (!chat.room) {
		return;
	}

	const channel = chat.roomChannels[chat.room.id];
	if (channel) {
		delete chat.roomChannels[chat.room.id];
		leaveChannel(chat, channel);
		chat.pollingRoomId = -1;
	}
}

export function queueChatMessage(chat: ChatClient, content: string, roomId: number) {
	if (chat.currentUser === null) {
		return;
	}

	const tempId = Math.floor(Math.random() * Date.now());
	const message = new ChatMessage({
		id: tempId,
		type: ChatMessage.TypeNormal,
		user_id: chat.currentUser.id,
		user: chat.currentUser,
		room_id: roomId,
		content,
		logged_on: new Date(),
		_isQueued: true,
	});

	setTimeSplit(chat, roomId, message);

	chat.messageQueue.push(message);

	sendChatMessage(chat, message);
}

function setTimeSplit(chat: ChatClient, roomId: number, message: ChatMessage) {
	message.combine = false;
	message.dateSplit = false;

	let messages = chat.messages[roomId];

	// For queued messages, we also factor in the other queued messages.
	if (message._isQueued) {
		messages = messages.concat(chat.messageQueue.filter(i => i.room_id === roomId));
	}

	// Find the message preceeding this one.
	// If we can't locate the message in the list, we assume it's not in the list yet and about to be added to the end.
	// Therefore, we use the last message in the list as previous and pretend this message is at the end of the list.
	let messageIndex = messages.findIndex(i => i.id === message.id);
	if (messageIndex === -1 && messages.length > 0) {
		messageIndex = messages.length;
	}

	if (messageIndex > 0) {
		const previousMessage = messages[messageIndex - 1];

		// Combine if the same user and within 5 minutes of their previous message.
		if (
			message.user.id === previousMessage.user.id &&
			message.logged_on.getTime() - previousMessage.logged_on.getTime() <= 5 * 60 * 1000
		) {
			message.combine = true;
		}

		// If the date is different than the date for the previous
		// message, we want to split it in the view.
		if (message.logged_on.toDateString() !== previousMessage.logged_on.toDateString()) {
			message.dateSplit = true;
			message.combine = false;
		}
	} else {
		// First message should show date.
		message.dateSplit = true;
	}
}

function outputMessage(
	chat: ChatClient,
	roomId: number,
	type: ChatMessageType,
	message: ChatMessage,
	isHistorical: boolean
) {
	if (!chat.room || !isInChatRoom(chat, roomId)) {
		return;
	}

	message.type = type;
	message.logged_on = new Date(message.logged_on);
	setTimeSplit(chat, roomId, message);

	if (!chat.room.isPrivateRoom && !isHistorical) {
		newChatNotification(chat, roomId);
	}

	// Push it into the room's message list.
	chat.messages[roomId].push(message);
}

function setupRoom(chat: ChatClient, room: ChatRoom, messages: ChatMessage[]) {
	if (!isInChatRoom(chat, room.id)) {
		if (room.type === ChatRoom.ROOM_PM) {
			// We need to rename the room to the username
			const friend = chat.friendsList.getByRoom(room.id);
			if (friend) {
				room.user = friend;
			}
		}
		// Set the room info
		Vue.set(chat.messages, '' + room.id, []);
		Vue.set(
			chat.roomMembers,
			'' + room.id,
			new ChatUserCollection(ChatUserCollection.TYPE_ROOM, room.members || [], chat)
		);

		setChatRoom(chat, room);
		processNewChatOutput(chat, room.id, messages, true);
	}
}

export function processNewChatOutput(
	chat: ChatClient,
	roomId: number,
	messages: ChatMessage[],
	isHistorical: boolean
) {
	if (!messages.length) {
		return;
	}

	messages.forEach(message => {
		outputMessage(chat, message.room_id, ChatMessage.TypeNormal, message, isHistorical);

		if (!isHistorical) {
			// Emit an event that we've sent out a new message.
			EventBus.emit('Chat.newMessage', <ChatNewMessageEvent>{
				message,
			});
		}
	});

	// After we received and output the message(s), update the time split for queued messages.
	chat.messageQueue.filter(i => i.room_id === roomId).forEach(i => setTimeSplit(chat, roomId, i));
}

function sendChatMessage(chat: ChatClient, message: ChatMessage) {
	message._error = false;
	message._isProcessing = true;
	chat.roomChannels[message.room_id]
		.push('message', { content: message.content })
		.receive('ok', data => {
			// Upon receiving confirmation from the server, remove the message from the queue and add
			// the received message to the list.
			// We do this here because we display the queued message in the window until we wait for this confirmation.
			// We have to do this swap at the same time so it seems like the message gets replaced seamlessly,
			// instead of having a very slight (but noticable) delay between adding the new message and removing the queued one.
			arrayRemove(chat.messageQueue, i => i.id === message.id);

			const newMessage = new ChatMessage(data);
			chat.roomChannels[message.room_id].processNewRoomMessage(newMessage);
		})
		.receive('error', response => {
			console.error('[Chat] Received error sending message', response);
			message._error = true;
			message._isProcessing = false;
		});
}

/** Set the message that is currently being edited, or 'null' to clear the state. */
export function setMessageEditing(chat: ChatClient, message: ChatMessage | null) {
	chat.messageEditing = message;
}

export function retryFailedQueuedMessage(chat: ChatClient, message: ChatMessage) {
	if (!message._isQueued || !message._error) {
		return;
	}

	// Assign new logged on time and order queued messages by date.
	message.logged_on = new Date();

	const roomQueuedMessages = arrayRemove(chat.messageQueue, i => i.room_id === message.room_id);
	if (roomQueuedMessages) {
		roomQueuedMessages.sort((a, b) => numberSort(a.logged_on.getTime(), b.logged_on.getTime()));
		chat.messageQueue.push(...roomQueuedMessages);
	}

	// After that, update the timesplit of those queued messages to make sure it's still correct after reordering.
	chat.messageQueue
		.filter(i => i.room_id === message.room_id)
		.forEach(i => setTimeSplit(chat, message.room_id, i));

	sendChatMessage(chat, message);
}

export function loadOlderChatMessages(chat: ChatClient, roomId: number) {
	return new Promise<void>((resolve, reject) => {
		const onLoadFailed = () => reject(new Error(`Failed to load messages.`));

		const onLoadMessages = (data: any) => {
			const oldMessages = data.messages.map((i: any) => new ChatMessage(i));

			// If no older messages, we reached the end of the history.
			if (oldMessages.length > 0) {
				const messages = [...oldMessages.reverse(), ...chat.messages[roomId]];

				// We have to clear out all messages and add them again so that we
				// calculate proper date splits and what not.
				chat.messages[roomId] = [];
				processNewChatOutput(chat, roomId, messages, false);
			}

			resolve();
		};

		const firstMessage = chat.messages[roomId][0];
		chat.roomChannels[roomId]
			.push('load_messages', { before_date: firstMessage.logged_on })
			.receive('ok', onLoadMessages)
			.receive('error', onLoadFailed)
			.receive('timeout', onLoadFailed);
	});
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

export function setChatFocused(chat: ChatClient, focused: boolean) {
	chat.isFocused = focused;

	if (chat.room && chat.currentUser) {
		if (chat.isFocused) {
			chat.roomChannels[chat.room.id].push('focus', { roomId: chat.room.id });
		} else {
			chat.roomChannels[chat.room.id].push('unfocus', { roomId: chat.room.id });
		}
	}
}

export function addGroupRoom(chat: ChatClient, members: number[]) {
	return chat.userChannel?.push('group_add', { member_ids: members }).receive('ok', response => {
		const newGroupRoom = new ChatRoom(response.room);
		chat.groupRooms.push(newGroupRoom);
		enterChatRoom(chat, newGroupRoom.id);
	});
}

export function addGroupMembers(chat: ChatClient, roomId: number, members: number[]) {
	return chat.roomChannels[roomId].push('member_add', { member_ids: members });
}

export async function leaveGroupRoom(chat: ChatClient, room: ChatRoom) {
	if (!room.isGroupRoom) {
		throw new Error(`Can't leave non-group rooms.`);
	}

	chat.userChannel?.push('group_leave', { room_id: room.id }).receive('ok', _response => {
		if (isInChatRoom(chat, room.id)) {
			leaveChatRoom(chat);
		}
	});
}

export function removeMessage(chat: ChatClient, msgId: number) {
	const room = chat.room;
	if (room) {
		chat.roomChannels[room.id].push('message_remove', { id: msgId });
	}
}

export function editMessage(chat: ChatClient, message: ChatMessage) {
	const room = chat.room;
	if (room) {
		chat.roomChannels[room.id].push('message_update', {
			content: message.content,
			id: message.id,
		});
	}
}

export function startTyping(chat: ChatClient) {
	const room = chat.room;
	if (room) {
		chat.roomChannels[room.id].push('start_typing', {});
	}
}

export function stopTyping(chat: ChatClient) {
	const room = chat.room;
	if (room) {
		chat.roomChannels[room.id].push('stop_typing', {});
	}
}

export function isInChatRoom(chat: ChatClient, roomId?: number) {
	if (!roomId) {
		return !!chat.room;
	}

	return chat.room ? chat.room.id === roomId : false;
}

export function updateChatRoomLastMessageOn(chat: ChatClient, message: ChatMessage) {
	const time = message.logged_on.getTime();

	// If it's a friend chat.
	const friend = chat.friendsList.getByRoom(message.room_id);
	if (friend) {
		friend.last_message_on = time;
		chat.friendsList.update(friend);
	}

	// If it's a group chat.
	const groupRoom = chat.groupRooms.find(i => i.id === message.room_id);
	if (groupRoom) {
		groupRoom.last_message_on = time;
	}
}
