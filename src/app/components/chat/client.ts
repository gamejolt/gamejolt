import { Channel, Socket } from 'phoenix';
import Vue from 'vue';
import { EventBus } from '../../../system/event/event-bus.service';
import { sleep } from '../../../utils/utils';
import { getCookie } from '../../../_common/cookie/cookie.service';
import { Environment } from '../../../_common/environment/environment.service';
import { Growls } from '../../../_common/growls/growls.service';
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
async function pollRequest(context: string, requestGetter: () => Promise<any>): Promise<any> {
	let result = null;
	let finished = false;
	let delay = 0;

	console.log(`[Chat] ${context}`);

	while (!finished) {
		try {
			const promise = requestGetter();
			result = await promise;
			finished = true;
		} catch (e) {
			const sleepMs = Math.min(30000, Math.random() * delay * 1000 + 1000);
			console.log(`[Chat] Failed request [${context}]. Reattempt in ${sleepMs} ms.`);
			await sleep(sleepMs);
		}

		delay++;
	}

	return result;
}

export class ChatClient {
	connected = false;
	socket: Socket | null = null;
	userChannel: ChatUserChannel | null = null;

	currentUser: ChatUser | null = null;
	friendsList: ChatUserCollection = null as any;
	friendsPopulated = false;

	room: ChatRoom | null = null;

	// The following are indexed by room ID.
	roomChannels: { [k: string]: ChatRoomChannel } = {};
	messages: { [k: string]: ChatMessage[] } = {};
	usersOnline: { [k: string]: ChatUserCollection } = {};
	notifications: { [k: string]: number } = {};
	isFocused = true;

	messageQueue: ChatMessage[] = [];

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

	get friendNotificationsCount() {
		let count = 0;
		for (const key of Object.keys(this.notifications)) {
			const cur = this.notifications[key];

			// Notifications for a room? Increment friend notifications.
			if (this.friendsList.getByRoom(parseInt(key, 10))) {
				count += cur || 0;
			}
		}

		return count;
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

	destroy() {
		if (!this.connected) {
			return;
		}

		reset(this);

		if (this.userChannel) {
			leaveChannel(this, this.userChannel);
			this.userChannel = null;
		}

		Object.keys(this.roomChannels).forEach(roomId => {
			leaveChannel(this, this.roomChannels[roomId]);
		});
		this.roomChannels = {};

		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}
}

function reset(chat: ChatClient) {
	chat.currentUser = null;
	chat.friendsList = new ChatUserCollection(ChatUserCollection.TYPE_FRIEND);
	chat.friendsPopulated = false;

	chat.room = null;

	// The following are indexed by roomId
	chat.messages = {};
	chat.usersOnline = {};
	chat.notifications = {};
	chat.isFocused = true;

	chat.messageQueue = [];
}

async function connect(chat: ChatClient) {
	const host = `${Environment.chatHost}/socket`;
	const frontend = await getCookie('frontend');
	const user = store.state.app.user;

	if (user === null || frontend === undefined) {
		return;
	}

	// heartbeat is 30 seconds, backend disconnects after 40 seconds
	chat.socket = new Socket(host, {
		heartbeatIntervalMs: 30000,
		params: { frontend },
	});

	chat.socket.onOpen(() => {
		chat.connected = true;
		setChatRoom(chat, undefined);
	});

	await pollRequest(
		'Connect to socket',
		() =>
			new Promise(resolve => {
				if (chat.socket !== null) {
					chat.socket.connect();
				}
				resolve();
			})
	);

	joinUserChannel(chat, user.id);
}

async function joinUserChannel(chat: ChatClient, userId: number) {
	const channel = new ChatUserChannel(userId, chat);
	const request = `Join user channel ${userId}`;

	await pollRequest(
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
						chat.friendsPopulated = true;
						chat.notifications = response.notifications;
						resolve();
					});
			})
	);
}

async function joinRoomChannel(chat: ChatClient, roomId: number) {
	const channel = new ChatRoomChannel(roomId, chat);

	await pollRequest(
		`Join room channel: ${roomId}`,
		() =>
			new Promise((resolve, reject) => {
				channel
					.join()
					.receive('error', reject)
					.receive('ok', response => {
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
	} else {
		if (chat.notifications[roomId]) {
			chat.notifications[roomId] = chat.notifications[roomId] + 1;
		} else {
			Vue.set(chat.notifications, '' + roomId, 1);
		}
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
	if (!store.state.isRightPaneVisible) {
		chat.sessionRoomId = roomId;
		store.dispatch('toggleRightPane');
	} else {
		if (!chat.socket) {
			return;
		}

		joinRoomChannel(chat, roomId);
	}
}

function leaveChannel(chat: ChatClient, channel: Channel) {
	channel.leave();
	if (chat.socket !== null) {
		chat.socket.remove(channel);
	}
}

export function leaveChatRoom(chat: ChatClient) {
	if (!chat.room) {
		return;
	}

	const channel = chat.roomChannels[chat.room.id];
	if (channel) {
		delete chat.roomChannels[chat.room.id];
		leaveChannel(chat, channel);
	}
}

export function queueChatMessage(chat: ChatClient, content: string, roomId: number) {
	// Trim the message of whitespace.
	content = content.replace(/^\s+/, '').replace(/\s+$/, '');

	if (content === '' || chat.currentUser === null) {
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
	});

	chat.messageQueue.push(message);

	sendNextMessage(chat);
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
	message.combine = false;
	message.dateSplit = false;

	if (chat.messages[roomId].length) {
		const latestMessage = chat.messages[roomId][chat.messages[roomId].length - 1];

		// Combine if the same user and within 5 minutes of their previous message.
		if (
			message.user.id === latestMessage.user.id &&
			message.logged_on.getTime() - latestMessage.logged_on.getTime() <= 5 * 60 * 1000
		) {
			message.combine = true;
		}

		// If the date is different than the date for the previous
		// message, we want to split it in the view.
		if (message.logged_on.toDateString() !== latestMessage.logged_on.toDateString()) {
			message.dateSplit = true;
			message.combine = false;
		}
	} else {
		// First message should show date.
		message.dateSplit = true;
	}

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

		setChatRoom(chat, room);
		processNewChatOutput(chat, messages, true);
	}
}

export function processNewChatOutput(
	chat: ChatClient,
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
}

function sendNextMessage(chat: ChatClient) {
	if (!chat.room) {
		return;
	}

	const message = chat.messageQueue.shift();

	if (!message) {
		return;
	}

	sendChatMessage(chat, message);
}

function sendChatMessage(chat: ChatClient, message: ChatMessage) {
	chat.roomChannels[message.room_id].push('message', { content: message.content });
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
				processNewChatOutput(chat, messages, false);
			}

			resolve();
		};

		const firstMessage = chat.messages[roomId][0];
		chat.roomChannels[roomId]
			.push('load_messages', { before_id: firstMessage.id })
			.receive('ok', onLoadMessages)
			.receive('error', onLoadFailed)
			.receive('timeout', onLoadFailed);
	});
}

/**
 * Will return null if the user is not their friend.
 */
export function isUserOnline(chat: ChatClient, userId: number): null | boolean {
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

export function isInChatRoom(chat: ChatClient, roomId?: number) {
	if (!roomId) {
		return !!chat.room;
	}

	return chat.room ? chat.room.id === roomId : false;
}

export function onChatNotification(chat: ChatClient, message: ChatMessage) {
	// Skip if already in the room.
	if (isInChatRoom(chat, message.room_id)) {
		return;
	}

	Growls.info({
		title: message.user.display_name,
		message: message.content,
		icon: message.user.img_avatar,
		onclick: () => enterChatRoom(chat, message.room_id),
		system: true,
	});
}
