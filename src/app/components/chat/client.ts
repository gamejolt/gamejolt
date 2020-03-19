import { Channel, Presence, Socket } from 'phoenix';
import Vue from 'vue';
import { sleep } from '../../../utils/utils';
import { getCookie } from '../../../_common/cookie/cookie.service';
import { Environment } from '../../../_common/environment/environment.service';
import { EventBus } from '../../../_common/event-bus/event-bus.service';
import { store } from '../../store';
import { ChatMessage, ChatMessageType } from './message';
import { ChatRoom } from './room';
import { ChatUser } from './user';
import { UserChannel } from './user-channel';
import { ChatUserCollection } from './user-collection';

export const ChatMaxNumMessages = 200;
export const ChatSiteModPermission = 2;

export interface ChatNewMessageEvent {
	isPrimer: boolean;
	message: ChatMessage;
}

/**
 * Polls a request until it returns a result, increases the delay time between requests after each failed attempt.
 * @param context Context for logging
 * @param requestGetter Function that generates a promise that represents the request
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
	publicRooms: ChatRoom[] = [];
	socket: Socket | null = null;
	userChannel: UserChannel | null = null;

	currentUser: ChatUser | null = null;
	friendsList: ChatUserCollection = null as any;
	friendsPopulated = false;

	room: ChatRoom | null = null;

	// The following are indexed by room ID.
	roomChannels: { [k: string]: Channel } = {};
	messages: { [k: string]: ChatMessage[] } = {};
	usersOnline: { [k: string]: ChatUserCollection } = {};
	notifications: { [k: string]: number } = {};
	isFocused = true;

	private messageQueue: ChatMessage[] = [];

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
		this._init();
	}

	private async _init() {
		if (GJ_IS_SSR) {
			return;
		}

		// Initialize after we've been created. This allows the chat to get
		// attached to the store before initializing all models within.
		await Vue.nextTick();
		this.reset();
		this.connect();
	}

	private reset() {
		this.currentUser = null;
		this.friendsList = new ChatUserCollection(ChatUserCollection.TYPE_FRIEND);
		this.friendsPopulated = false;

		this.room = null;

		// The following are indexed by roomId
		this.messages = {};
		this.usersOnline = {};
		this.notifications = {};
		this.isFocused = true;

		this.messageQueue = [];
	}

	private async reconnect() {
		await sleep(2000);
		if (this.connected) {
			this.disconnect();
			this.connect();
		}
	}

	logout() {
		this.reconnect();
	}

	private async connect() {
		const host = `${Environment.chatHost}/socket`;
		const frontend = await getCookie('frontend');
		const user = store.state.app.user;

		if (user === null || frontend === undefined) {
			return;
		}

		// heartbeat is 30 seconds, backend disconnects after 40 seconds
		this.socket = new Socket(host, {
			heartbeatIntervalMs: 30000,
			params: { frontend },
		});

		this.socket.onOpen(() => {
			this.connected = true;
			this.setRoom(undefined);
		});

		await pollRequest(
			'Connect to socket',
			() =>
				new Promise(resolve => {
					if (this.socket !== null) {
						this.socket.connect();
					}
					resolve();
				})
		);

		this.joinUserChannel(user.id);
	}

	private async joinUserChannel(userId: number) {
		const channel = new UserChannel(userId, this);
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
							this.userChannel = channel;
							this.currentUser = currentUser;
							this.friendsList = friendsList;
							this.friendsPopulated = true;
							this.notifications = response.notifications;
							this.publicRooms = response.public_rooms.map(
								(room: any) => new ChatRoom(room)
							);
							resolve();
						});
				})
		);
	}

	private syncPresentUsers(presences: any, room: ChatRoom) {
		const presentUsers: ChatUser[] = [];
		Presence.list(presences).map((presence: any) => {
			const user = new ChatUser(presence.user);
			user.isOnline = true;
			presentUsers.push(user);
		});

		if (room.isGroupRoom) {
			Vue.set(
				this.usersOnline,
				'' + room.id,
				new ChatUserCollection(ChatUserCollection.TYPE_ROOM, presentUsers)
			);
		}
	}

	disconnect() {
		if (this.connected) {
			this.reset();
			if (this.userChannel) {
				this.leaveChannel(this.userChannel);
			}
			Object.keys(this.roomChannels).forEach(roomId => {
				this.leaveChannel(this.roomChannels[roomId]);
			});

			this.roomChannels = {};
			this.userChannel = null;
			if (this.socket !== null) {
				this.socket.disconnect();
				this.socket = null;
			}
		}
	}

	private setRoom(newRoom: ChatRoom | undefined) {
		// In single-room mode, if there is a currently active room, we always want
		// to clear it out. Whether we're setting to null or a new room.
		this.leaveRoom();

		if (newRoom) {
			if (this.currentUser) {
				this.roomChannels[newRoom.id].push('focus', { roomId: newRoom.id });
			}

			if (newRoom.isGroupRoom) {
				Vue.delete(this.notifications, '' + newRoom.id);
			}

			this.sessionRoomId = newRoom.id;
		}

		this.room = newRoom || null;
	}

	newNotification(roomId: number) {
		if (this.isInRoom(roomId) && this.isFocused) {
		} else {
			if (this.notifications[roomId]) {
				this.notifications[roomId] = this.notifications[roomId] + 1;
			} else {
				Vue.set(this.notifications, '' + roomId, 1);
			}
		}
	}

	/**
	 * Call this to open a room. It'll do the correct thing to either open the chat if closed, or
	 * enter the room.
	 */
	async enterRoom(roomId: number) {
		if (this.isInRoom(roomId)) {
			return;
		}

		// If the chat isn't visible yet, set the session room to this new room and open it. That
		// will in turn do the entry. Otherwise we want to just switch rooms.
		if (!store.state.isRightPaneVisible) {
			this.sessionRoomId = roomId;
			store.dispatch('toggleRightPane');
		} else {
			if (!this.socket) {
				return;
			}

			const channel = this.socket.channel(`room:${roomId}`);
			let presences: any = {};
			let room: ChatRoom;

			await pollRequest(
				`Join room channel: ${roomId}`,
				() =>
					new Promise((resolve, reject) => {
						channel
							.join()
							.receive('error', reject)
							.receive('ok', response => {
								this.roomChannels[roomId] = channel;
								room = new ChatRoom(response.room);
								const msgs = response.messages.map(
									(msg: ChatMessage) => new ChatMessage(msg)
								);
								msgs.reverse();
								this._joinRoom(room, msgs);
								resolve();
							});
					})
			);

			channel.on('presence_state', state => {
				presences = Presence.syncState(presences, state);
				this.syncPresentUsers(presences, room);
			});

			channel.on('presence_diff', diff => {
				presences = Presence.syncDiff(presences, diff);
				this.syncPresentUsers(presences, room);
			});

			channel.on('message', data => {
				if (this.currentUser && data.user.id === this.currentUser.id) {
					return;
				}

				const message = new ChatMessage(data);
				this._processNewOutput([message], false);

				const friend = this.friendsList.getByRoom(message.roomId);
				if (friend) {
					friend.lastMessageOn = message.loggedOn.getTime();
					this.friendsList.update(friend);
				}
			});

			channel.on('clear_notifications', data => {
				if (this.isInRoom(data.room_id)) {
					Vue.delete(this.notifications, '' + data.room_id);
				}
			});

			channel.on('user_updated', data => {
				if (this.room && this.isInRoom(roomId) && this.room.isGroupRoom) {
					this.usersOnline[roomId].update(data);
				}
			});

			channel.onClose(() => {
				if (this.isInRoom(roomId)) {
					this.setRoom(undefined);

					// Reset the room we were in
					Vue.delete(this.usersOnline, roomId);
					Vue.delete(this.messages, roomId);
				}
			});
		}
	}

	/**
	 * Call this to close the chat completely. It will hide the right sidebar.
	 */
	closeChat() {
		// Make sure the right pane is hidden. This will eventually leave the room.
		if (store.state.isRightPaneVisible) {
			store.dispatch('toggleRightPane');
		}
	}

	leaveChannel(channel: Channel) {
		channel.leave();
		if (this.socket !== null) {
			this.socket.remove(channel);
		}
	}

	leaveRoom() {
		if (!this.room) {
			return;
		}
		const channel = this.roomChannels[this.room.id];
		if (channel) {
			delete this.roomChannels[this.room.id];
			this.leaveChannel(channel);
		}
	}

	queueMessage(content: string, roomId: number) {
		// Trim the message of whitespace.
		content = content.replace(/^\s+/, '').replace(/\s+$/, '');

		if (content === '' || this.currentUser === null) {
			return;
		}

		const tempId = Math.floor(Math.random() * Date.now());
		const message = new ChatMessage({
			id: tempId,
			type: ChatMessage.TypeNormal,
			userId: this.currentUser.id,
			user: this.currentUser,
			state: ChatMessage.StatePending,
			roomId,
			content,
			loggedOn: new Date(),
		});

		this.messageQueue.push(message);

		this._sendNextMessage();
	}

	private outputMessage(
		roomId: number,
		type: ChatMessageType,
		message: ChatMessage,
		isPrimer: boolean
	) {
		if (this.room && this.isInRoom(roomId)) {
			message.type = type;
			message.loggedOn = new Date(message.loggedOn);
			message.combine = false;
			message.dateSplit = false;

			if (this.messages[roomId].length) {
				const latestMessage = this.messages[roomId][this.messages[roomId].length - 1];

				// Combine if the same user and within 5 minutes of their previous message.
				if (
					message.user.id === latestMessage.user.id &&
					message.loggedOn.getTime() - latestMessage.loggedOn.getTime() <= 5 * 60 * 1000
				) {
					message.combine = true;
				}

				// If the date is different than the date for the previous
				// message, we want to split it in the view.
				if (message.loggedOn.toDateString() !== latestMessage.loggedOn.toDateString()) {
					message.dateSplit = true;
					message.combine = false;
				}
			} else {
				// First message should show date.
				message.dateSplit = true;
			}

			if (!this.room.isPrivateRoom && !isPrimer) {
				this.newNotification(roomId);
			}

			// Push it into the room's message list.
			this.messages[roomId].push(message);

			// If we are over our max message count, then remove older messages.
			if (this.messages[roomId].length > ChatMaxNumMessages) {
				this.messages[roomId].splice(0, 1); // Just remove the oldest.
			}
		}
	}

	private _joinRoom(room: ChatRoom, messages: ChatMessage[]) {
		if (!this.isInRoom(room.id)) {
			if (room.type === ChatRoom.ROOM_PM) {
				// We need to rename the room to the username
				const friend = this.friendsList.getByRoom(room.id);
				if (friend) {
					room.user = friend;
				}
			}
			// Set the room info
			Vue.set(this.messages, '' + room.id, []);

			this.setRoom(room);
			this._processNewOutput(messages, true);
		}
	}

	mod(userId: number, roomId: number) {
		// TODO: Implement.
		console.log('Mod action', userId, roomId);
	}

	demod(userId: number, roomId: number) {
		// TODO: Implement.
		console.log('Demod action', userId, roomId);
	}

	mute(userId: number, roomId: number) {
		// TODO: Implement.
		console.log('Mute action', userId, roomId);
	}

	unmute(userId: number, roomId: number) {
		// TODO: Implement.
		console.log('Unmute action', userId, roomId);
	}

	removeMessage(msgId: number, roomId: number) {
		// TODO: Implement.
		console.log('Message remove', msgId, roomId);
	}

	private _processNewOutput(messages: ChatMessage[], isPrimer: boolean) {
		if (!messages.length) {
			return;
		}

		messages.forEach(message => {
			this.outputMessage(message.roomId, ChatMessage.TypeNormal, message, isPrimer);

			// Emit an event that we've sent out a new message.
			EventBus.emit('Chat.newMessage', <ChatNewMessageEvent>{
				message,
				isPrimer,
			});
		});
	}

	private _sendNextMessage() {
		if (!this.room) {
			return;
		}

		const message = this.messageQueue.shift();

		if (!message) {
			return;
		}

		if (this.room.isMuted) {
			this.sendRoboJolt(
				this.room.id,
				// tslint:disable-next-line:max-line-length
				`Beep boop bop. You are muted and cannot talk. Please read the chat rules for every room you enter so you may avoid this in the future. Bzzzzzzzzt.`
			);
			return;
		}

		this.outputMessage(message.roomId, ChatMessage.TypeNormal, message, false);
		this.roomChannels[message.roomId]
			.push('message', {
				content: message.content,
			})
			.receive('ok', data => {
				message.id = data.id;
				message.state = ChatMessage.StateSent;
			})
			.receive('error', () => {
				message.state = ChatMessage.StateFailed;
			})
			.receive('timeout', () => {
				message.state = ChatMessage.StateFailed;
			});
	}

	private sendRoboJolt(roomId: number, content: string) {
		const message = new ChatMessage({
			id: Math.random(),
			type: ChatMessage.TypeSystem,
			userId: 192757,
			user: new ChatUser({
				id: 192757,
				username: 'robo-jolt-2000',
				displayName: 'RoboJolt 2000',
				// tslint:disable-next-line:max-line-length
				imgAvatar: `https://secure.gravatar.com/avatar/eff6eb6a79a34774e8f94400931ce6c9?s=200&r=pg&d=https%3A%2F%2Fs.gjcdn.net%2Fimg%2Fno-avatar-3.png`,
			}),
			roomId,
			content,
			loggedOn: new Date(),
		});

		this.outputMessage(roomId, ChatMessage.TypeSystem, message, false);
	}

	canModerate(room: ChatRoom, targetUser: ChatUser, action = '') {
		if (!this.currentUser || room.type === 'pm') {
			return false;
		}

		// No one can moderate site mods.
		if (targetUser.permissionLevel >= ChatSiteModPermission) {
			return false;
		}

		// Site mods can moderate everyone else.
		if (this.currentUser.permissionLevel >= ChatSiteModPermission) {
			return true;
		}

		if (!room.isMod) {
			return false;
		}

		if (room.isMod === 'owner' && targetUser.isMod !== 'owner') {
			return true;
		}

		// Must be an owner or higher to mod someone else.
		if (action === 'mod') {
			return false;
		}

		if (room.isMod === 'moderator' && !targetUser.isMod) {
			return true;
		}

		return false;
	}

	setFocused(focused: boolean) {
		this.isFocused = focused;

		if (this.room && this.currentUser) {
			if (this.isFocused) {
				this.roomChannels[this.room.id].push('focus', { roomId: this.room.id });
			} else {
				this.roomChannels[this.room.id].push('unfocus', { roomId: this.room.id });
			}
		}
	}

	isInRoom(roomId?: number) {
		if (!roomId) {
			return !!this.room;
		}

		return this.room ? this.room.id === roomId : false;
	}
}
