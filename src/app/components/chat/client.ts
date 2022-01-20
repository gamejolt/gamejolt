import { Channel, Socket } from 'phoenix';
import { markRaw, reactive } from 'vue';
import { arrayRemove, numberSort } from '../../../utils/array';
import { CancelToken } from '../../../utils/cancel-token';
import { sleep } from '../../../utils/utils';
import { Api } from '../../../_common/api/api.service';
import { getCookie } from '../../../_common/cookie/cookie.service';
import { Environment } from '../../../_common/environment/environment.service';
import { commonStore } from '../../../_common/store/common-store';
import { EventTopic } from '../../../_common/system/event/event-topic';
import { AppStore } from '../../store';
import { ChatMessage, ChatMessageType } from './message';
import { ChatRoom } from './room';
import { ChatRoomChannel } from './room-channel';
import { ChatUser } from './user';
import { ChatUserChannel } from './user-channel';
import { ChatUserCollection } from './user-collection';

export const ChatKey = Symbol('chat');

export const onNewChatMessage = new EventTopic<ChatMessage>();

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
async function pollRequest<T>(
	context: string,
	cancelToken: CancelToken,
	requestGetter: () => Promise<T>
): Promise<T | null> {
	let result = null;
	let finished = false;
	let delay = 0;

	console.log(`[Chat] ${context}`);

	while (!finished) {
		// Abort if our chat server changed.
		if (cancelToken.isCanceled) {
			return null;
		}

		try {
			const promise = requestGetter();
			result = await promise;
			finished = true;
		} catch (e) {
			if (delay < 30_000) {
				delay += 1_000 + 1_000 * Math.random();
			}
			console.error(`[Chat] Failed request [${context}]. Reattempt in ${delay} ms.`);
			await sleep(delay);
		}

		delay++;
	}

	return result;
}

export function createChatClient({ appStore }: { appStore: AppStore }) {
	// We need to be able to get the raw app store without unwrapping its refs.
	return reactive(new ChatClient(() => appStore)) as ChatClient;
}

export class ChatClient {
	constructor(public readonly _getAppStore: () => AppStore) {}

	connected = false;
	isGuest = false;
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
	 * If set, will connect as a guest, using this token.
	 */
	guestToken: string | null = null;

	cancelToken: CancelToken = null as any;

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

		for (const roomId in this.notifications) {
			const channel = this.roomChannels[roomId];

			if (
				// Only count for non-instanced channels.
				(channel === undefined || !channel.instanced) &&
				Object.prototype.hasOwnProperty.call(this.notifications, roomId)
			) {
				const roomCount = this.notifications[roomId];
				count += roomCount || 0;
			}
		}

		return count;
	}
}

export function initChatClient(chat: ChatClient) {
	chat.cancelToken = new CancelToken();

	reset(chat);
	connect(chat);
}

function reset(chat: ChatClient) {
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

	chat.cancelToken.cancel();
	chat.cancelToken = new CancelToken();
}

export async function setGuestChatToken(chat: ChatClient, guestToken: string) {
	const tokenChanged = chat.guestToken !== guestToken;
	chat.guestToken = guestToken;

	if (!chat.isGuest || tokenChanged) {
		chat.isGuest = true;
		reconnect(chat);
	}
}

export async function unsetGuestChatToken(chat: ChatClient) {
	chat.guestToken = null;

	if (chat.isGuest) {
		chat.isGuest = false;
		reconnect(chat);
	}
}

function reconnect(chat: ChatClient) {
	destroy(chat);
	connect(chat);
}

async function connect(chat: ChatClient) {
	const cancelToken = chat.cancelToken;

	const user = commonStore.user.value;
	if ((!chat.isGuest && !user) || (chat.isGuest && !!user)) {
		return;
	}

	const authToken = chat.isGuest ? chat.guestToken : await getCookie('frontend');
	if (cancelToken.isCanceled) {
		console.log('[Chat] Aborted connection (1)');
		return;
	}

	const timedOut = commonStore.isUserTimedOut.value;

	if (!authToken || timedOut) {
		// Not properly logged in.
		return;
	}

	console.log('[Chat] Connecting...');

	const results = await pollRequest('Auth to server', cancelToken, async () => {
		// Do the host check first. This request will get rate limited and only
		// let a certain number through, which will cause the second one to not
		// get processed.
		const hostResult = await Api.sendRawRequest(`${Environment.chat}/host`, {
			timeout: 3_000,
		});

		if (cancelToken.isCanceled) {
			return null;
		}

		const params =
			user && !chat.isGuest
				? { auth_token: authToken, user_id: user.id }
				: { auth_token: authToken };

		const tokenResult = await Api.sendRawRequest(`${Environment.chat}/token`, {
			data: params,
			timeout: 3_000,
		});

		if (cancelToken.isCanceled) {
			return null;
		}

		return { host: hostResult, token: tokenResult };
	});

	if (cancelToken.isCanceled) {
		console.log('[Chat] Aborted connection (2)');
		return;
	}

	if (!results) {
		return;
	}

	const host = `${results.host.data}`;
	const token = results.token.data.token;

	console.log('[Chat] Server selected:', host);

	// heartbeat is 30 seconds, backend disconnects after 40 seconds
	chat.socket = markRaw(
		new Socket(host, {
			heartbeatIntervalMs: 30000,
			params: { token },
		})
	);

	// HACK! There is no built in way to stop a Phoenix socket from attempting
	// to reconnect on its own after it got disconnected. this replaces the
	// socket's "reconnectTimer" property with an empty object that matches the
	// Phoenix "Timer" signature The 'reconnectTimer' usually restarts the
	// connection after a delay, this prevents that from happening
	const socketAny: any = chat.socket;
	if (Object.prototype.hasOwnProperty.call(socketAny, 'reconnectTimer')) {
		socketAny.reconnectTimer = { scheduleTimeout: () => {}, reset: () => {} };
	}

	chat.socket.onOpen(() => {
		if (cancelToken.isCanceled) {
			return;
		}

		chat.connected = true;
		setChatRoom(chat, undefined);
	});

	chat.socket.onError((e: any) => {
		if (cancelToken.isCanceled) {
			return;
		}

		console.warn('[Chat] Got error from socket');
		console.warn(e);
		reconnect(chat);
	});

	chat.socket.onClose(() => {
		if (cancelToken.isCanceled) {
			return;
		}

		console.warn('[Chat] Socket closed unexpectedly');
		reconnect(chat);
	});

	await pollRequest(
		'Connect to socket',
		cancelToken,
		() =>
			new Promise<void>(resolve => {
				chat.socket?.connect();
				resolve();
			})
	);

	if (cancelToken.isCanceled) {
		console.log('[Chat] Aborted connection (3)');
		return;
	}

	if (user) {
		joinUserChannel(chat, user.id);
	}
}

export function destroy(chat: ChatClient) {
	if (chat.connected) {
		console.log('[Chat] Destroying client...');
	} else {
		console.warn('[Chat] Destroying client (before we got fully connected)');
	}

	reset(chat);

	if (chat.userChannel) {
		leaveSocketChannel(chat, chat.userChannel.socketChannel);
		chat.userChannel = null;
	}

	Object.keys(chat.roomChannels).forEach(roomId => {
		leaveSocketChannel(chat, chat.roomChannels[roomId].socketChannel);
	});
	chat.roomChannels = {};

	if (chat.socket) {
		console.log('[Chat] Disconnecting socket');
		chat.socket.disconnect();
		chat.socket = null;
	}
}

async function joinUserChannel(chat: ChatClient, userId: number) {
	const cancelToken = chat.cancelToken;

	const channel = reactive(new ChatUserChannel(userId, chat)) as ChatUserChannel;
	channel.init();

	await pollRequest(
		`Join user channel ${userId}`,
		cancelToken,
		() =>
			new Promise<void>((resolve, reject) => {
				channel.socketChannel
					.join()
					.receive('error', reject)
					.receive('ok', response => {
						if (cancelToken.isCanceled) {
							return;
						}

						chat.currentUser = new ChatUser(response.user);
						chat.friendsList = new ChatUserCollection(
							ChatUserCollection.TYPE_FRIEND,
							response.friends || []
						);
						chat.userChannel = channel;
						chat.notifications = response.notifications;
						chat.groupRooms = (response.groups as unknown[]).map(
							(room: ChatRoom) => new ChatRoom(room)
						);
						chat.populated = true;
						resolve();
					});
			})
	);
}

export async function joinInstancedRoomChannel(chat: ChatClient, roomId: number) {
	const cancelToken = chat.cancelToken;
	const channel = reactive(new ChatRoomChannel(roomId, chat)) as ChatRoomChannel;
	channel.instanced = true;
	channel.init();

	await new Promise<void>((resolve, reject) => {
		channel.socketChannel
			.join()
			.receive('error', reject)
			.receive('ok', response => {
				if (cancelToken.isCanceled) {
					return;
				}

				chat.roomChannels[roomId] = channel;
				channel.room = new ChatRoom(response.room);
				const messages = (response.messages as unknown[]).map(
					(msg: ChatMessage) => new ChatMessage(msg)
				);
				messages.reverse();
				setupRoom(chat, channel.room, messages);
				resolve();
			});
	});

	return channel;
}

async function joinRoomChannel(chat: ChatClient, roomId: number) {
	const cancelToken = chat.cancelToken;

	const channel = reactive(new ChatRoomChannel(roomId, chat)) as ChatRoomChannel;
	channel.init();

	if (chat.pollingRoomId === roomId) {
		console.log('[Chat] Do not attempt to join the same room twice.', roomId);
		return;
	}

	chat.pollingRoomId = roomId;

	await pollRequest(
		`Join room channel: ${roomId}`,
		cancelToken,
		() =>
			new Promise<void>((resolve, reject) => {
				if (cancelToken.isCanceled) {
					return;
				}

				// If the client started polling a different room, stop polling this one.
				if (chat.pollingRoomId !== roomId) {
					console.log('[Chat] Stop joining room', roomId);
					resolve();
				}

				channel.socketChannel
					.join()
					.receive('error', reject)
					.receive('ok', response => {
						if (cancelToken.isCanceled) {
							return;
						}

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
			chat.roomChannels[newRoom.id].socketChannel.push('focus', { roomId: newRoom.id });
		}

		if (newRoom.isGroupRoom) {
			delete chat.notifications[newRoom.id];
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
		++chat.notifications[roomId];
	} else {
		chat.notifications[roomId] = 1;
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

	const appStore = chat._getAppStore();

	// If the chat isn't visible yet, set the session room to this new room and open it. That
	// will in turn do the entry. Otherwise we want to just switch rooms.
	if (appStore.visibleLeftPane.value !== 'chat') {
		chat.sessionRoomId = roomId;
		appStore.toggleChatPane();
	} else {
		if (!chat.socket) {
			return;
		}

		joinRoomChannel(chat, roomId);
	}
}

function leaveSocketChannel(chat: ChatClient, channel: Channel) {
	channel.leave();
	chat.socket?.remove(channel);
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
		delete chat.roomChannels[room.id];
		leaveSocketChannel(chat, channel.socketChannel);
		chat.pollingRoomId = -1;
	}
}

export function queueChatMessage(
	chat: ChatClient,
	type: ChatMessageType,
	content: string,
	roomId: number
) {
	if (chat.currentUser === null) {
		return;
	}

	const tempId = Math.floor(Math.random() * Date.now());
	const message = reactive(
		new ChatMessage({
			id: tempId,
			user_id: chat.currentUser.id,
			user: chat.currentUser,
			room_id: roomId,
			type,
			content,
			logged_on: new Date(),
			_isQueued: true,
		})
	) as ChatMessage;

	setTimeSplit(chat, roomId, message);

	chat.messageQueue.push(message);

	sendChatMessage(chat, message);
}

export function setTimeSplit(chat: ChatClient, roomId: number, message: ChatMessage) {
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
	message: ChatMessage,
	isHistorical: boolean
) {
	const isInstanced = isRoomInstanced(chat, roomId);
	if (!isInstanced && (!chat.room || !isInChatRoom(chat, roomId))) {
		return;
	}

	message.logged_on = new Date(message.logged_on);
	setTimeSplit(chat, roomId, message);

	if (!isHistorical) {
		if (isInstanced || (chat.room && !chat.room.isPrivateRoom)) {
			newChatNotification(chat, roomId);
		}
	}

	// Push it into the room's message list.
	chat.messages[roomId].push(message);
}

function setupRoom(chat: ChatClient, room: ChatRoom, messages: ChatMessage[]) {
	if (isRoomInstanced(chat, room.id) || !isInChatRoom(chat, room.id)) {
		if (room.type === ChatRoom.ROOM_PM) {
			// We need to rename the room to the username
			const friend = chat.friendsList.getByRoom(room.id);
			if (friend) {
				room.user = friend;
			}
		}
		// Set the room info
		chat.messages[room.id] = [];
		chat.roomMembers[room.id] = new ChatUserCollection(
			ChatUserCollection.TYPE_ROOM,
			room.members || [],
			chat
		);

		// Only set the room as "the" active room when it's not instanced.
		if (!isRoomInstanced(chat, room.id)) {
			setChatRoom(chat, room);
		}
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
		outputMessage(chat, message.room_id, message, isHistorical);

		if (!isHistorical) {
			// Emit an event that we've sent out a new message.
			onNewChatMessage.next(message);
		}
	});

	// After we received and output the message(s), update the time split for queued messages.
	chat.messageQueue.filter(i => i.room_id === roomId).forEach(i => setTimeSplit(chat, roomId, i));
}

function sendChatMessage(chat: ChatClient, message: ChatMessage) {
	message._error = false;
	message._isProcessing = true;

	chat.roomChannels[message.room_id].socketChannel
		.push('message', { content: message.content })
		.receive('ok', data => {
			// Upon receiving confirmation from the server, remove the message from the queue and add
			// the received message to the list.
			// We do this here because we display the queued message in the window until we wait for this confirmation.
			// We have to do this swap at the same time so it seems like the message gets replaced seamlessly,
			// instead of having a very slight (but noticable) delay between adding the new message and removing the queued one.
			arrayRemove(chat.messageQueue, i => i.id === message.id);

			const newMessage = reactive(new ChatMessage(data)) as ChatMessage;
			chat.roomChannels[message.room_id].processNewRoomMessage(newMessage);
		})
		.receive('error', response => {
			console.error('[Chat] Received error sending message', response);
			message._error = true;
			message._isProcessing = false;
		});
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
		chat.roomChannels[roomId].socketChannel
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

	if (chat.currentUser) {
		// Update focused for current room.
		if (chat.room) {
			if (chat.isFocused) {
				chat.roomChannels[chat.room.id].socketChannel.push('focus', {
					roomId: chat.room.id,
				});
			} else {
				chat.roomChannels[chat.room.id].socketChannel.push('unfocus', {
					roomId: chat.room.id,
				});
			}
		}

		// Update focused for all instanced rooms.
		for (const roomId in chat.roomChannels) {
			if (Object.prototype.hasOwnProperty.call(chat.roomChannels, roomId)) {
				const roomChannel = chat.roomChannels[roomId];
				if (roomChannel.instanced) {
					const channelRoomId = roomChannel.room.id;
					if (chat.isFocused) {
						chat.roomChannels[channelRoomId].socketChannel.push('focus', {
							roomId: channelRoomId,
						});
					} else {
						chat.roomChannels[channelRoomId].socketChannel.push('unfocus', {
							roomId: channelRoomId,
						});
					}
				}
			}
		}
	}

	if (chat.room && chat.currentUser) {
		if (chat.isFocused) {
			chat.roomChannels[chat.room.id].socketChannel.push('focus', { roomId: chat.room.id });
		} else {
			chat.roomChannels[chat.room.id].socketChannel.push('unfocus', { roomId: chat.room.id });
		}
	}
}

export function addGroupRoom(chat: ChatClient, members: number[]) {
	return chat.userChannel?.socketChannel
		.push('group_add', { member_ids: members })
		.receive('ok', response => {
			const newGroupRoom = new ChatRoom(response.room);
			chat.groupRooms.push(newGroupRoom);
			enterChatRoom(chat, newGroupRoom.id);
		});
}

export function addGroupMembers(chat: ChatClient, roomId: number, members: number[]) {
	return chat.roomChannels[roomId].socketChannel.push('member_add', { member_ids: members });
}

export async function leaveGroupRoom(chat: ChatClient, room: ChatRoom) {
	if (!room.isGroupRoom) {
		throw new Error(`Can't leave non-group rooms.`);
	}

	chat.userChannel?.socketChannel.push('group_leave', { room_id: room.id });
}

export function removeMessage(chat: ChatClient, room: ChatRoom, msgId: number) {
	chat.roomChannels[room.id].socketChannel.push('message_remove', { id: msgId });
}

export function editMessage(chat: ChatClient, room: ChatRoom, message: ChatMessage) {
	chat.roomChannels[room.id].socketChannel.push('message_update', {
		content: message.content,
		id: message.id,
	});
}

export function editChatRoomTitle(chat: ChatClient, title: string) {
	const room = chat.room;
	if (room) {
		chat.roomChannels[room.id].socketChannel.push('update_title', {
			title,
		});
	}
}

export function startTyping(chat: ChatClient, room: ChatRoom) {
	chat.roomChannels[room.id].socketChannel.push('start_typing', {});
}

export function stopTyping(chat: ChatClient, room: ChatRoom) {
	chat.roomChannels[room.id].socketChannel.push('stop_typing', {});
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
		chat.friendsList.update(friend);
	}

	// If it's a group chat.
	const groupRoom = chat.groupRooms.find(i => i.id === message.room_id);
	if (groupRoom) {
		groupRoom.last_message_on = time;
	}
}

export function kickGroupMember(chat: ChatClient, room: ChatRoom, memberId: number) {
	chat.roomChannels[room.id].socketChannel.push('kick_member', { member_id: memberId });
}

/**
 * Called when something internal changes that would require us to resort our
 * member arrays.
 *
 * For example, if a friend goes online/offline, we resort the room member lists
 * to reflect that status.
 */
export function recollectChatRoomMembers(chat: ChatClient) {
	Object.values(chat.roomMembers).forEach(i => i.recollect());
}

/**
 * Attempts to get the role for a user in a room.
 * This is only possible if the role is bootstrapped onto the input user,
 * or if the user is currently in the room.
 */
export function tryGetRoomRole(chat: ChatClient, room: ChatRoom, user: ChatUser) {
	if (room.owner_id === user.id) {
		return 'owner';
	}

	// The room userCollection always has the most up to date role information.
	const roomUser = chat.roomMembers[room.id].get(user);
	if (roomUser && roomUser.role !== null) {
		return roomUser.role;
	}

	// See if the role is set onto the room.
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
export function userCanModerateOtherUser(
	chat: ChatClient,
	room: ChatRoom,
	user: ChatUser,
	otherUser: ChatUser
) {
	// Cannot moderate yourself.
	if (user.id === otherUser.id) {
		return false;
	}

	const userRole = tryGetRoomRole(chat, room, user);
	const otherUserRole = tryGetRoomRole(chat, room, otherUser);

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

export function promoteToModerator(chat: ChatClient, room: ChatRoom, memberId: number) {
	chat.roomChannels[room.id].socketChannel.push('promote_moderator', { member_id: memberId });
}

export function demoteModerator(chat: ChatClient, room: ChatRoom, memberId: number) {
	chat.roomChannels[room.id].socketChannel.push('demote_moderator', { member_id: memberId });
}
