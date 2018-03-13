import Vue from 'vue';

import { store } from '../../store/index';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';
import { ChatRoom } from './room';
import { Primus } from '../../../lib/gj-lib-client/components/primus/primus.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Analytics } from '../../../lib/gj-lib-client/components/analytics/analytics.service';
import { ChatMessage, ChatMessageType } from './message';
import { EventBus } from '../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { ChatNotification } from './notification/notification.service';
import { getCookie } from '../../../_common/cookie/cookie.service';

export const ChatMaxNumMessages = 200;
export const ChatSiteModPermission = 2;

interface PrimusChatEvent {
	event: string;
	data: any;
}

export interface ChatNewMessageEvent {
	isPrimer: boolean;
	message: ChatMessage;
}

export class ChatClient {
	connected = false;
	allCount = 0;
	publicRooms: ChatRoom[] = [];

	currentUser: ChatUser | null = null;
	friendsList: ChatUserCollection = null as any;
	friendsPopulated = false;

	room: ChatRoom | null = null;

	// The following are indexed by room ID.
	messages: { [k: string]: ChatMessage[] } = {};
	usersOnline: { [k: string]: ChatUserCollection } = {};
	notifications: { [k: string]: number } = {};
	isFocused = true;

	private messageQueue: string[] = [];
	private sendingMessage = false;

	private spark: any = null;
	private primus: any = null;
	private startTime = 0;

	/**
	 * The session room is stored within their local session. It's their last active room. We reopen
	 * it when entering the chat again.
	 */
	get sessionRoomId(): number | undefined {
		return sessionStorage['chat:room'] ? parseInt(sessionStorage['chat:room'], 10) : undefined;
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
		this.initPrimus();
	}

	private reset() {
		this.startTime = Date.now();

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
		this.sendingMessage = false;
	}

	private reconnect() {
		this.reset();

		if (this.spark) {
			// This disconnects but tells primus to allow the reconnect behavior to kick in.
			this.spark.end(undefined, { reconnect: true });
		}
	}

	logout() {
		this.reconnect();
	}

	/**
	 * Initializes Primus and sets up our event watching.
	 */
	private async initPrimus() {
		this.primus = await Primus.createConnection(Environment.chatHost);

		// On new connection or reconnection.
		this.primus.on('open', async (spark: any) => {
			// Cap it at a max of 60s.
			const ms = Date.now() - this.startTime;
			Analytics.trackTiming('chat', 'spark-open', Math.min(ms, 60000));

			this.spark = spark;

			// We also need to reset all the chat stuff, in case there was a disconnect
			// We need to split this up, because rooms can be rejoined and we don't want to stop that.
			// this._reset();

			// We set the cookie. This will kick the server to get the information we need for chatting as this user.
			const cookie = await getCookie('frontend');
			this.primus.write({ event: 'set-cookie', cookie: cookie });
		});

		// On any message...
		this.primus.on('data', (msg: any) => this._processMessage(msg));
	}

	private setRoom(newRoom: ChatRoom | undefined) {
		// In single-room mode, if there is a currently active room, we always want
		// to clear it out. Whether we're setting to null or a new room.
		this.leaveRoom();

		if (newRoom) {
			if (this.currentUser) {
				this.primus.write({ event: 'room-focus', roomId: newRoom.id });
			}

			if (newRoom.isGroupRoom) {
				Vue.delete(this.notifications, '' + newRoom.id);
			}

			this.sessionRoomId = newRoom.id;
		}

		this.room = newRoom || null;
	}

	private newNotification(roomId: number) {
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
	enterRoom(roomId: number) {
		if (this.isInRoom(roomId)) {
			return;
		}

		// If the chat isn't visible yet, set the session room to this new room and open it. That
		// will in turn do the entry. Otherwise we want to just switch rooms.
		if (!store.state.isRightPaneVisible) {
			this.sessionRoomId = roomId;
			store.dispatch('toggleRightPane');
		} else {
			this.primus.write({
				event: 'enter-room',
				roomId: roomId,
				// isSource was when you could be in multiple rooms at a time.
				// It's no longer used.
				isSource: true,
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

	/**
	 * Call this to simply leave the current room. Usually you should call "closeChat" instead. But
	 * if you want to not touch the sidebar and just leave the room, you can use this.
	 */
	leaveRoom() {
		if (!this.room) {
			return;
		}

		this.primus.write({
			event: 'leave-room',
			roomId: this.room.id,
		});
	}

	queueMessage(message: string) {
		// Trim the message of whitespace.
		message = message.replace(/^\s+/, '').replace(/\s+$/, '');

		if (message === '') {
			return;
		}

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
					message.userId === latestMessage.userId &&
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

	private _processMessage(msg: PrimusChatEvent) {
		if (msg.event === 'connected') {
			// Cap it at a max of 60s.
			const ms = Date.now() - this.startTime;
			Analytics.trackTiming('chat', 'connected', Math.min(ms, 60000));

			this.currentUser = msg.data.user ? new ChatUser(msg.data.user) : null;
			this.connected = true;

			this.setRoom(undefined);
		} else if (msg.event === 'friends-list') {
			const friendsList = msg.data.friendsList;
			if (friendsList) {
				this.friendsList = new ChatUserCollection(
					ChatUserCollection.TYPE_FRIEND,
					friendsList
				);
				this.friendsPopulated = true;
			}
		} else if (msg.event === 'public-rooms') {
			this.publicRooms = msg.data.rooms.map((r: any) => new ChatRoom(r));
		} else if (msg.event === 'notifications') {
			this.notifications = msg.data.notifications;
		} else if (msg.event === 'message') {
			const message = new ChatMessage(msg.data.message);

			this._processNewOutput([message], false);

			const friend = this.friendsList.getByRoom(message.roomId);
			if (friend) {
				friend.lastMessageOn = message.loggedOn.getTime();
				this.friendsList.update(friend);
			}

			// TODO: Old functionality, change this later on. This was for checking if the message was sent successfully or not.
			this.sendingMessage = false;

			// You would have to receive confirmation that your last message was sent before sending your new one.
			if (this.messageQueue.length) {
				this._sendNextMessage();
			}
		} else if (msg.event === 'message-removed') {
			const id = msg.data.id;
			const roomId = msg.data.roomId;

			if (this.messages[roomId].length) {
				const index = this.messages[roomId].findIndex(message => message.id === id);
				if (index !== -1) {
					this.messages[roomId].splice(index, 1);
				}
			}
		} else if (msg.event === 'notification') {
			const message = new ChatMessage(msg.data.message);

			// We got a notification for some room.
			// If the notification key is null, set it to 1.
			this.newNotification(message.roomId);

			const friend = this.friendsList.getByRoom(message.roomId);
			if (friend) {
				console.log(message);
				friend.lastMessageOn = message.loggedOn.getTime();
				console.log('Updated friend timestamp to ' + friend.lastMessageOn);
				this.friendsList.update(friend);
			}

			ChatNotification.notification(message);
		} else if (msg.event === 'clear-notifications') {
			const roomId = msg.data.roomId;

			if (this.isInRoom(roomId)) {
				Vue.delete(this.notifications, '' + roomId);
			}
		} else if (msg.event === 'user-enter-room') {
			const user = new ChatUser(msg.data.user);
			const roomId = msg.data.roomId;

			if (this.room && this.isInRoom(roomId) && this.room.isGroupRoom) {
				this.usersOnline[roomId].add(user);
			}
		} else if (msg.event === 'user-leave-room') {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;

			if (this.room && this.isInRoom(roomId) && this.room.isGroupRoom) {
				this.usersOnline[roomId].remove(userId);
			}
		} else if (msg.event === 'user-muted') {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;
			const isGlobal = msg.data.isGlobal;

			if (this.room && this.room.isGroupRoom) {
				// Remove their messages from view.
				if (this.messages[roomId].length) {
					this.messages[roomId] = this.messages[roomId].filter(
						message => message.userId !== userId
					);
				}

				// Mark that they're muted in the user list of the room.
				if (this.usersOnline[roomId]) {
					this.usersOnline[roomId].mute(userId, isGlobal);
				}
			}
		} else if (msg.event === 'user-unmuted') {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;
			const isGlobal = msg.data.isGlobal;

			if (this.room && this.room.isGroupRoom) {
				// Mark that they're unmuted in the user list of the room.
				if (this.usersOnline[roomId]) {
					this.usersOnline[roomId].unmute(userId, isGlobal);
				}
			}
		} else if (msg.event === 'role-set') {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;
			const action = msg.data.action;

			if (this.room && this.room.isGroupRoom && this.usersOnline[roomId]) {
				if (action === 'mod') {
					this.usersOnline[roomId].mod(userId);
				} else if (action === 'demod') {
					this.usersOnline[roomId].demod(userId);
				}
			}
		} else if (msg.event === 'message-cleared') {
			// const messageId = msg.data.messageId;
			// const roomId = msg.data.roomId;
			// TODO
		} else if (msg.event === 'room-cleared') {
			// const roomId = msg.data.roomId;
			// TODO
		} else if (msg.event === 'prime-chatroom') {
			const room = new ChatRoom(msg.data.room);
			const messages = msg.data.messages.map((m: any) => new ChatMessage(m));
			const users = msg.data.users;

			// Primed messages are loaded in descending order w.r.t. id, lets make that ascending
			messages.reverse();
			this._joinRoom(room, messages, users);
		} else if (msg.event === 'room-updated') {
			// const room = msg.data.room;
			// TODO
		} else if (msg.event === 'you-updated') {
			const newUser = new ChatUser(msg.data.user);
			this.currentUser = newUser;
		} else if (msg.event === 'user-updated') {
			const roomId = msg.data.roomId;
			const user = new ChatUser(msg.data.user);

			if (this.room && this.isInRoom(roomId) && this.room.isGroupRoom) {
				this.usersOnline[roomId].update(user);
			}
		} else if (msg.event === 'friend-updated') {
			const user = new ChatUser(msg.data.user);
			this.friendsList.update(user);
		} else if (msg.event === 'friend-add') {
			const user = new ChatUser(msg.data.user);
			this.friendsList.add(user);
		} else if (msg.event === 'friend-remove') {
			const userId = msg.data.userId;

			const friend = this.friendsList.get(userId);
			if (friend && this.isInRoom(friend.roomId)) {
				this.leaveRoom();
			}

			this.friendsList.remove(userId);
		} else if (msg.event === 'friend-online') {
			const user = new ChatUser(msg.data.user);
			this.friendsList.online(user);
		} else if (msg.event === 'friend-offline') {
			const userId = msg.data.userId;
			this.friendsList.offline(userId);
		} else if (msg.event === 'you-leave-room') {
			const roomId = msg.data.roomId;

			if (this.isInRoom(roomId)) {
				this.setRoom(undefined);

				// Reset the room we were in
				Vue.delete(this.usersOnline, roomId);
				Vue.delete(this.messages, roomId);
			}
		} else if (msg.event === 'online-count') {
			this.allCount = msg.data.onlineCount;
		}
	}

	private _joinRoom(room: ChatRoom, messages: ChatMessage[], users: any[]) {
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

			if (room.isGroupRoom) {
				Vue.set(
					this.usersOnline,
					'' + room.id,
					new ChatUserCollection(ChatUserCollection.TYPE_ROOM, users)
				);
			}

			this.setRoom(room);
			this._processNewOutput(messages, true);
		}
	}

	mod(userId: number, roomId: number) {
		this.primus.write({ event: 'user-mod', userId: userId, roomId: roomId });
	}

	demod(userId: number, roomId: number) {
		this.primus.write({ event: 'user-demod', userId: userId, roomId: roomId });
	}

	mute(userId: number, roomId: number) {
		this.primus.write({ event: 'user-mute', userId: userId, roomId: roomId });
	}

	unmute(userId: number, roomId: number) {
		this.primus.write({ event: 'user-unmute', userId: userId, roomId: roomId });
	}

	removeMessage(msgId: number, roomId: number) {
		this.primus.write({
			event: 'message-remove',
			msgId: msgId,
			roomId: roomId,
		});
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
		if (this.sendingMessage || !this.room) {
			return;
		}

		this.sendingMessage = true;
		const message = this.messageQueue.shift();

		if (!message) {
			this.sendingMessage = false;
			return;
		}

		if (this.room.isMuted) {
			this.sendRoboJolt(
				this.room.id,
				// tslint:disable-next-line:max-line-length
				`*Beep boop bop.* You are muted and cannot talk. Please read the chat rules for every room you enter so you may avoid this in the future. *Bzzzzzzzzt.*`,
				// tslint:disable-next-line:max-line-length
				`<p><em>Beep boop bop.</em> You are muted and cannot talk. Please read the chat rules for every room you enter so you may avoid this in the future. <em>Bzzzzzzzzt.</em></p>`
			);
			this.sendingMessage = false;
			return;
		}

		// Send the message to the server. The server will send a callback response on whether or not it was successful.
		this.primus.write({
			event: 'message',
			content: message,
			roomId: this.room.id,
		});
	}

	private sendRoboJolt(roomId: number, contentRaw: string, content: string) {
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
			contentRaw,
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
				this.primus.write({ event: 'room-focus', roomId: this.room.id });
			} else {
				this.primus.write({ event: 'room-unfocus', roomId: this.room.id });
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
