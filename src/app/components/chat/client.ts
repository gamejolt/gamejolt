import Vue from 'vue';

import { store, Mutations } from '../../store/index';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';
import { ChatRoom } from './room';
import { Primus } from '../../../lib/gj-lib-client/components/primus/primus.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Analytics } from '../../../lib/gj-lib-client/components/analytics/analytics.service';
import { ChatMessage, ChatMessageType } from './message';
import { ChatRoomStorage } from './room-storage.service';
import { Chat } from './chat.service';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';

export interface ChatClientOptions
{
	/**
	 * Single room mode should only allow a single room to be
	 * open at any one time.
	 */
	forceSingleRoomMode?: boolean;
}

interface PrimusChatEvent
{
	event: string;
	data: any;
}

async function getCookie( name: string )
{
	return 'iuufhol5no2b8eua9rgd9urvj2';

	// Within Client we have to access it connectedthis way.
	if ( Environment.isClient ) {
		const gui = require( 'nw.gui' );
		const win = gui.Window.get();
		win.cookies.get( {
			url: 'game-jolt-client',
			name: name,
		},
		( cookieData: any ) =>
		{
			if ( !cookieData ) {
				return undefined;
			}
			return cookieData.value;
		} );
	}
	else {
		let i, x, y, ARRcookies = document.cookie.split( ';' );
		for ( i = 0; i < ARRcookies.length; i++ ) {
			x = ARRcookies[ i ].substr( 0, ARRcookies[ i ].indexOf( '=' ) );
			y = ARRcookies[ i ].substr( ARRcookies[ i ].indexOf( '=' ) + 1 );
			x = x.replace( /^\s+|\s+$/g, '' );
			if ( x === name ) {
				return unescape( y );
			}
		}
		return undefined;
	}
}

export class ChatClient
{
	connected = false;
	spark: any = null;
	allCount = 0;
	publicRooms: ChatRoom[] = [];
	forceSingleRoomMode = false;
	singleRoomMode = false;

	primus: any = null;

	startTime = 0;
	currentUser?: ChatUser;
	friendsList: ChatUserCollection;
	friendsPopulated = false;

	room?: ChatRoom;

	// The following are indexed by room ID.
	messages: { [k: number]: ChatMessage[] } = {};
	usersOnline: { [k: number]: ChatUserCollection } = {};
	notifications: { [k: number]: number } = {};
	openRooms: { [k: number]: ChatRoom } = {};
	isFocused = true;

	messageQueue: string[] = [];
	sendingMessage = false;

	// TODO
	constructor( options: ChatClientOptions = {} )
	{
		this.forceSingleRoomMode = !!options.forceSingleRoomMode;

		// Initialize Primus.
		this._reset();
		this.initPrimus();
	}

	private _reset()
	{
		this.startTime = Date.now();

		this.currentUser = undefined;
		this.friendsList = new ChatUserCollection( ChatUserCollection.TYPE_FRIEND );
		this.friendsPopulated = false;

		this.room = undefined;

		// The following are indexed by roomId
		this.messages = {};
		this.usersOnline = {};
		this.notifications = {};
		this.openRooms = {};
		this.isFocused = true;

		this.messageQueue = [];
		this.sendingMessage = false;
	}

	reconnect()
	{
		this._reset();

		if ( this.spark ) {

			// This disconnects but tells primus to allow the reconnect behavior to kick in.
			this.spark.end( undefined, { reconnect: true } );
		}
	}

	logout()
	{
		this.reconnect();

		// TODO
		// $rootScope.$emit( 'Chat.logOut' );
	}

	/**
	 * Initializes Primus and sets up our event watching.
	 */
	async initPrimus()
	{
		this.primus = await Primus.createConnection( Environment.chatHost );

		// On new connection or reconnection.
		this.primus.on( 'open', async ( spark: any ) =>
		{
			// Cap it at a max of 60s.
			const ms = Date.now() - this.startTime;
			Analytics.trackTiming( 'chat', 'spark-open', Math.min( ms, 60000 ) );

			this.spark = spark;

			// We also need to reset all the chat stuff, in case there was a disconnect
			// We need to split this up, because rooms can be rejoined and we don't want to stop that.
			// this._reset();

			// We set the cookie. This will kick the server to get the information we need for chatting as this user.
			const cookie = await getCookie( 'frontend' );
			this.primus.write( { event: 'set-cookie', cookie: cookie } );
		} );

		// On any message...
		this.primus.on( 'data', ( msg: any ) => this._processMessage( msg ) );
	}

	setRoom( newRoom: ChatRoom | undefined, options: { sendUnfocusEvent?: boolean } = {} )
	{
		Object.assign( options, {
			sendUnfocusEvent: true,
		} );

		// In single-room mode, if there is a currently active room, we always want
		// to clear it out. Whether we're setting to null or a new room.
		if ( this.singleRoomMode && this.room ) {
			this.leaveRoom( this.room.id );
		}

		// We don't send focus/unfocus events if they are a guest.
		// We don't care about notifications for them in that case.
		if ( this.room ) {
			if ( options.sendUnfocusEvent && this.currentUser ) {
				this.primus.write( { event: 'room-unfocus', roomId: this.room.id } );
			}
			// this.friendsList.touchRoom( this.room.id );
		}

		if ( newRoom ) {
			if ( this.currentUser ) {
				this.primus.write( { event: 'room-focus', roomId: newRoom.id } );
			}
			// this.friendsList.touchRoom( newRoom.id );

			if ( newRoom.isGroupRoom ) {
				Vue.delete( this.notifications, '' + newRoom.id );
				// $rootScope.$emit( 'Chat.notificationsUpdated' );
			}
		}

		this.room = newRoom;
	}

	newNotification( roomId: number )
	{
		if ( this.room && this.room.id === roomId && this.isFocused ) {

		}
		else {
			if ( this.notifications[ roomId ] ) {
				this.notifications[ roomId ] = this.notifications[ roomId ] + 1;
			}
			else {
				this.notifications[ roomId ] = 1;
			}
		}

		// $rootScope.$emit( 'Chat.notificationsUpdated' );
	}

	/**
	 * isSource is whether or not we opened it in this session. If it's false,
	 * then it may have been opened through another session and we just want it
	 * to show in our rooms list.
	 */
	enterRoom( roomId: number, isSource: boolean )
	{
		if ( this.room && this.room.id === roomId ) {
			this.minimizeRoom();
		}
		else {
			if ( roomId && !this.openRooms[ roomId ] ) {

				// Only allow a certain number of tabs to be open at once.
				if ( Object.keys( this.openRooms ).length >= Chat.MAX_NUM_TABS ) {
					Growls.error( 'You can only have ' + Chat.MAX_NUM_TABS + ' chat tabs open at once.', 'Too Many Chats' );
					return;
				}

				this.primus.write( {
					event: 'enter-room',
					roomId: roomId,
					isSource: isSource || false,
				} );

				// $rootScope.$emit( 'Chat.joinRoom', {
				// 	roomId: roomId,
				// 	isSource: isSource || false
				// } );
			}
			else {
				this.maximizeRoom( roomId );
			}

			// If we opened this room in this session explicitly, make sure the right pane is visible.
			if ( isSource && !store.getters.isRightPaneVisible ) {
				store.commit( Mutations.toggleRightPane );
			}
		}
	}

	leaveRoom( roomId: number )
	{
		if ( roomId && this.openRooms[ roomId ] ) {
			this.primus.write( {
				event: 'leave-room',
				roomId: roomId,
			} );

			// $rootScope.$emit( 'Chat.leaveRoom', {
			// 	roomId: roomId,
			// } );
		}
	}

	maximizeRoom( roomId: number )
	{
		if ( this.openRooms[ roomId ] ) {
			this.setRoom( this.openRooms[ roomId ] );
		}
	}

	minimizeRoom()
	{
		this.setRoom( undefined );
	}

	queueMessage( message: string )
	{
		// Trim the message of whitespace.
		message = message.replace( /^\s+/, '' ).replace( /\s+$/, '' );

		if ( message === '' ) {
			return;
		}

		this.messageQueue.push( message );
		this._sendNextMessage();
	}

	outputMessage( roomId: number, type: ChatMessageType, message: ChatMessage, isPrimer: boolean )
	{
		if ( this.openRooms[ roomId ] ) {

			message.type = type;
			message.loggedOn = new Date( message.loggedOn );
			message.combine = false;
			message.dateSplit = false;

			if ( this.messages[ roomId ].length ) {
				const latestMessage = this.messages[ roomId ][ this.messages[ roomId ].length - 1 ];

				// Combine if the same user and within 5 minutes of their previous message.
				if ( message.userId === latestMessage.userId
					&& message.loggedOn.getTime() - latestMessage.loggedOn.getTime() <= 5 * 60 * 1000
				) {
					message.combine = true;
				}

				// If the date is different than the date for the previous
				// message, we want to split it in the view.
				if ( message.loggedOn.toDateString() !== latestMessage.loggedOn.toDateString() ) {
					message.dateSplit = true;
					message.combine = false;
				}
			}
			else {
				// First message should show date.
				message.dateSplit = true;
			}

			if ( !this.openRooms[ roomId ].isPrivateRoom && !isPrimer ) {
				this.newNotification( roomId );
			}

			// Push it into the room's message list.
			this.messages[ roomId ].push( message );

			// If we are over our max message count, then remove older messages.
			if ( this.messages[ roomId ].length > Chat.MAX_NUM_MESSAGES ) {
				this.messages[ roomId ].splice( 0, 1 );  // Just remove the oldest.
			}
		}
	}

	private _processMessage( msg: PrimusChatEvent )
	{
		/**
		 * Will be called when the user is ready to chat (set-cookie must be sent by us before this fired).
		 *
		 * string `event` 'connected'
		 * object `payload`
		 */
		if ( msg.event === 'connected' ) {

			// Cap it at a max of 60s.
			const ms = Date.now() - this.startTime;
			Analytics.trackTiming( 'chat', 'connected', Math.min( ms, 60000 ) );

			const lastRoomId = this.room ? this.room.id : undefined;

			this.currentUser = msg.data.user ? new ChatUser( msg.data.user ) : undefined;
			this.connected = true;
			this.openRooms = {}; // If there are open rooms, we can't re-enter the room.

			// If they are a guest, only allow them to view a single room at a time.
			// The constructor can force single room mode for if they are browsing on mobile, etc.
			if ( !this.currentUser || this.forceSingleRoomMode ) {
				this.singleRoomMode = true;
			}
			else {
				this.singleRoomMode = false;
			}

			this.setRoom( undefined );

			if ( !this.singleRoomMode ) {
				ChatRoomStorage.init();
				ChatRoomStorage.getJoinedRooms().forEach(
					( roomId ) => this.enterRoom( roomId, roomId === lastRoomId )
				);
			}
			else {
				ChatRoomStorage.destroy();
			}

			// $rootScope.$emit( 'Chat.connected', {} );
		}
		else if ( msg.event === 'friends-list' ) {

			const friendsList = msg.data.friendsList;
			if ( friendsList ) {

				this.friendsList = new ChatUserCollection( ChatUserCollection.TYPE_FRIEND, friendsList );
				this.friendsPopulated = true;
				// $rootScope.$emit( 'Chat.friendsListUpdated', {} );
			}
		}
		else if ( msg.event === 'public-rooms' ) {
			this.publicRooms = msg.data.rooms.map( ( r: any ) => new ChatRoom( r ) );
		}
		else if ( msg.event === 'notifications' ) {
			this.notifications = msg.data.notifications;
			// $rootScope.$emit( 'Chat.notificationsUpdated' );
		}
		else if ( msg.event === 'message' ) {
			const message = new ChatMessage( msg.data.message );

			this._processNewOutput( [ message ], false );

			// TODO: Old functionality, change this later on. This was for checking if the message was sent successfully or not.
			this.sendingMessage = false;

			// You would have to receive confirmation that your last message was sent before sending your new one.
			if ( this.messageQueue.length ) {
				this._sendNextMessage();
			}

			// $rootScope.$emit( 'Chat.message', message );
		}
		else if ( msg.event === 'message-removed' ) {
			const id = msg.data.id;
			const roomId = msg.data.roomId;

			if ( this.messages[ roomId ].length ) {
				const index = this.messages[ roomId ].findIndex( ( message ) => message.id === id );
				if ( index !== -1 ) {
					this.messages[ roomId ].splice( index, 1 );
				}
			}
		}
		else if ( msg.event === 'notification' ) {
			const message = new ChatMessage( msg.data.message );

			// We got a notification for some room.
			// If the notification key is null, set it to 1.
			this.newNotification( message.roomId );

			// $rootScope.$emit( 'Chat.notification', message, this.notifications[ message.roomId ] );
		}
		else if ( msg.event === 'clear-notifications' ) {
			const roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] ) {
				Vue.delete( this.notifications, roomId );

				// $rootScope.$emit( 'Chat.notificationsUpdated' );
			}
		}
		else if ( msg.event === 'user-enter-room' ) {
			const user = new ChatUser( msg.data.user );
			const roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] && this.openRooms[ roomId ].isGroupRoom ) {
				this.usersOnline[ roomId ].add( user );
			}
		}
		else if ( msg.event === 'user-leave-room' ) {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] && this.openRooms[ roomId ].isGroupRoom ) {
				this.usersOnline[ roomId ].remove( userId );
			}
		}
		else if ( msg.event === 'user-muted' ) {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;
			const isGlobal = msg.data.isGlobal;
			const room = this.openRooms[ roomId ];

			if ( room && room.isGroupRoom ) {

				// Remove their messages from view.
				if ( this.messages[ roomId ].length ) {
					const index = this.messages[ roomId ].findIndex( ( message ) => message.userId === userId );
					if ( index !== -1 ) {
						this.messages[ roomId ].splice( index, 1 );
					}
				}

				// Mark that they're muted in the user list of the room.
				if ( this.usersOnline[ roomId ] ) {
					this.usersOnline[ roomId ].mute( userId, isGlobal );
				}
			}
		}
		else if ( msg.event === 'user-unmuted' ) {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;
			const isGlobal = msg.data.isGlobal;
			const room = this.openRooms[ roomId ];

			if ( room && room.isGroupRoom ) {

				// Mark that they're unmuted in the user list of the room.
				if ( this.usersOnline[ roomId ] ) {
					this.usersOnline[ roomId ].unmute( userId, isGlobal );
				}
			}
		}
		else if ( msg.event === 'role-set' ) {
			const userId = msg.data.userId;
			const roomId = msg.data.roomId;
			const action = msg.data.action;
			const room = this.openRooms[ roomId ];

			if ( room && room.isGroupRoom && this.usersOnline[ roomId ] ) {
				if ( action === 'mod' ) {
					this.usersOnline[ roomId ].mod( userId );
				}
				else if ( action === 'demod' ) {
					this.usersOnline[ roomId ].demod( userId );
				}
			}
		}
		else if ( msg.event === 'message-cleared' ) {
			// const messageId = msg.data.messageId;
			// const roomId = msg.data.roomId;
			// TODO
		}
		else if ( msg.event === 'room-cleared' ) {
			// const roomId = msg.data.roomId;
			// TODO
		}
		else if ( msg.event === 'prime-chatroom' ) {
			const room = new ChatRoom( msg.data.room );
			const messages = msg.data.messages.map( ( m: any ) => new ChatMessage( m ) );
			const users = msg.data.users;
			const isSource = msg.data.isSource;

			// Primed messages are loaded in descending order w.r.t. id, lets make that ascending
			messages.reverse();
			this._joinRoom( room, messages, users, isSource );
		}

		else if ( msg.event === 'room-updated' ) {
			// const room = msg.data.room;
			// TODO
		}
		else if ( msg.event === 'you-updated' ) {
			const newUser = new ChatUser( msg.data.user );
			this.currentUser = newUser;
		}
		else if ( msg.event === 'user-updated' ) {
			const roomId = msg.data.roomId;
			const user = new ChatUser( msg.data.user );

			if ( this.openRooms[ roomId ] && this.openRooms[ roomId ].isGroupRoom ) {
				this.usersOnline[ roomId ].update( user );
			}
		}
		else if ( msg.event === 'friend-updated' ) {
			const user = new ChatUser( msg.data.user );
			this.friendsList.update( user );
		}
		else if ( msg.event === 'friend-add' ) {
			const user = new ChatUser( msg.data.user );
			this.friendsList.add( user );
			// $rootScope.$emit( 'Chat.friendsListUpdated', {} );
		}
		else if ( msg.event === 'friend-remove' ) {
			const userId = msg.data.userId;

			// Delete their room

			const friend = this.friendsList.get( userId );
			if ( friend ) {
				this.leaveRoom( friend.roomId );
			}

			this.friendsList.remove( userId );
			// $rootScope.$emit( 'Chat.friendsListUpdated', {} );
		}
		else if ( msg.event === 'friend-online' ) {
			const user = new ChatUser( msg.data.user );
			this.friendsList.online( user );
			// $rootScope.$emit( 'Chat.friendsListUpdated', {} );
			// $rootScope.$emit( 'Chat.friendOnline', user.id );
		}
		else if ( msg.event === 'friend-offline' ) {
			const userId = msg.data.userId;
			this.friendsList.offline( userId );
			// $rootScope.$emit( 'Chat.friendsListUpdated', {} );
			// $rootScope.$emit( 'Chat.friendOffline', userId );
		}
		else if ( msg.event === 'you-leave-room' ) {
			const roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] ) {
				if ( this.room && this.room.id === roomId ) {

					// Sending an unfocus event while we're not in the room results in an error.
					this.setRoom( undefined, { sendUnfocusEvent: false } );
				}

				// If there was a PM'd user before, let's update the status so it doesn't show their room is open anymore
				// if ( this.pmUsers[ roomId ] ) {
				// 	this.friendsList.touchRoom( roomId );
				// }

				// Reset the room we were in
				Vue.delete( this.usersOnline, roomId );
				Vue.delete( this.openRooms, roomId );
				Vue.delete( this.messages, roomId );
				// Vue.delete( this.pmUsers, roomId );
			}
		}
		else if ( msg.event === 'invalid-room' ) {
			// const roomId = msg.data.roomId;

			// Remove this room from room storage if it happened to be there.
			// If other local sessions were joined, let's disconnect them.
			// $rootScope.$emit( 'Chat.leaveRoom', {
			// 	roomId: roomId,
			// } );
		}
		else if ( msg.event === 'online-count' ) {
			this.allCount = msg.data.onlineCount;
		}
	}

	private _joinRoom( room: ChatRoom, messages: ChatMessage[], users: any[], isSource: boolean )
	{
		if ( !this.room || this.room.id !== room.id ) {
			if ( room.type === ChatRoom.ROOM_PM ) { // We need to rename the room to the username

				const friend = this.friendsList.getByRoom( room.id );
				if ( friend ) {
					room.user = friend;
				}
			}

			// Set the room info
			Vue.set( this.openRooms, '' + room.id, room );
			Vue.set( this.messages, '' + room.id, [] );

			if ( room.isGroupRoom ) {
				Vue.set( this.usersOnline, '' + room.id, new ChatUserCollection( ChatUserCollection.TYPE_ROOM, users ) );

				this.refreshModStates();
				this.refreshMutedStates();
			}
			else if ( room.isPmRoom ) {

				// Since we cleared notifications, gotta touch them.
				// this.friendsList.touchRoom( room.id );
			}

			this._processNewOutput( messages, true );

			// If isSource is true, that means that this client actually opened the room
			// so we open it here. In the other clients we don't.
			if ( isSource ) {
				this.setRoom( room );
			}

			// $rootScope.$emit( 'Chat.notificationsUpdated' );
		}
	}

	mod( userId: number, roomId: number )
	{
		this.primus.write( { event: 'user-mod', userId: userId, roomId: roomId } );
	}

	demod( userId: number, roomId: number )
	{
		this.primus.write( { event: 'user-demod', userId: userId, roomId: roomId } );
	}

	mute( userId: number, roomId: number )
	{
		this.primus.write( { event: 'user-mute', userId: userId, roomId: roomId } );
	}

	unmute( userId: number, roomId: number )
	{
		this.primus.write( { event: 'user-unmute', userId: userId, roomId: roomId } );
	}

	removeMessage( msgId: number, roomId: number )
	{
		this.primus.write( { event: 'message-remove', msgId: msgId, roomId: roomId } );
	}

	private _processNewOutput( messages: ChatMessage[], isPrimer: boolean )
	{
		if ( !messages.length ) {
			return;
		}

		messages.forEach( ( msg ) =>
		{
			this.outputMessage( msg.roomId, ChatMessage.TypeNormal, msg, isPrimer );

			// Emit an event that we've sent out a new message.
			// $rootScope.$emit( 'Chat.newMessage', { message: msg, isPrimer: isPrimer } );
		} );
	}

	private _sendNextMessage()
	{
		if ( this.sendingMessage || !this.room ) {
			return;
		}

		this.sendingMessage = true;
		const message = this.messageQueue.shift();

		if ( !message ) {
			this.sendingMessage = false;
			return;
		}

		if ( this.checkRoomMutedState( this.room.id ) ) {
			this.sendRoboJolt(
				this.room.id,
				'*Beep boop bop.* You are muted and cannot talk. Please read the chat rules for every room you enter so you may avoid this in the future. *Bzzzzzzzzt.*',
				'<p><em>Beep boop bop.</em> You are muted and cannot talk. Please read the chat rules for every room you enter so you may avoid this in the future. <em>Bzzzzzzzzt.</em></p>'
			);
			this.sendingMessage = false;
			return;
		}

		// Send the message to the server. The server will send a callback response on whether or not it was successful.
		this.primus.write( { event: 'message', content: message, roomId: this.room.id } );
	}

	sendRoboJolt( roomId: number, contentRaw: string, content: string )
	{
		const message = new ChatMessage( {
			id: Math.random(),
			type: ChatMessage.TypeSystem,
			userId: 192757,
			user: new ChatUser( {
				id: 192757,
				username: 'robo-jolt-2000',
				displayName: 'RoboJolt 2000',
				imgAvatar: 'https://secure.gravatar.com/avatar/eff6eb6a79a34774e8f94400931ce6c9?s=200&r=pg&d=https%3A%2F%2Fs.gjcdn.net%2Fimg%2Fno-avatar-3.png',
			} ),
			roomId,
			contentRaw,
			content,
			loggedOn: new Date(),
		} );

		this.outputMessage( roomId, ChatMessage.TypeSystem, message, false );
	}

	canModerate( room: ChatRoom, targetUser: ChatUser, action = '' )
	{
		if ( !this.currentUser ) {
			return false;
		}

		// No one can moderate site mods.
		if ( targetUser.permissionLevel >= Chat.SITE_MOD_PERMISSION ) {
			return false;
		}

		// Site mods can moderate everyone else.
		if ( this.currentUser.permissionLevel >= Chat.SITE_MOD_PERMISSION ) {
			return true;
		}

		if ( !room.isMod ) {
			return false;
		}

		if ( room.isMod === 'owner' && targetUser.isMod !== 'owner' ) {
			return true;
		}

		// Must be an owner or higher to mod someone else.
		if ( action === 'mod' ) {
			return false;
		}

		if ( room.isMod === 'moderator' && !targetUser.isMod ) {
			return true;
		}

		return false;
	}

	refreshModStates()
	{
		// Guest
		if ( !this.currentUser ) {
			return;
		}

		Object.keys( this.openRooms ).forEach( ( _roomId ) =>
		{
			const roomId = parseInt( _roomId, 10 );
			const room = this.openRooms[ roomId ];

			if ( !room.isGroupRoom ) {
				return;
			}

			const us = this.usersOnline[ roomId ].get( this.currentUser!.id );
			if ( us ) {
				room.isMod = us.isMod || false;
			}
		} );
	}

	refreshMutedStates()
	{
		// Guest
		if ( !this.currentUser ) {
			return;
		}

		Object.keys( this.openRooms ).forEach( ( _roomId ) =>
		{
			const roomId = parseInt( _roomId, 10 );
			const room = this.openRooms[ roomId ];

			if ( !room.isGroupRoom ) {
				return;
			}

			const us = this.usersOnline[ roomId ].get( this.currentUser!.id );
			if ( us ) {
				room.isMutedGlobal = !!us.isMutedGlobal;
				room.isMutedRoom = !!us.isMutedRoom;
			}
		} );
	}

	checkRoomMutedState( roomId: number )
	{
		// Guest
		if ( !this.currentUser ) {
			return false;
		}

		const room = this.openRooms[ roomId ];
		if ( !room || !room.isGroupRoom ) {
			return false;
		}

		return room.isMutedGlobal || room.isMutedRoom;
	}

	setFocused( focused: boolean )
	{
		this.isFocused = focused;

		if ( this.room && this.currentUser ) {
			if ( this.isFocused ) {
				this.primus.write( { event: 'room-focus', roomId: this.room.id } );
			} else {
				this.primus.write( { event: 'room-unfocus', roomId: this.room.id } );
			}

			// this.friendsList.touchRoom( this.room.id );
		}
	}

	hasOpenRooms()
	{
		return Object.keys( this.openRooms ).length > 0;
	}

	isInRoom( roomId: number )
	{
		if ( !roomId ) {
			return !!this.room;
		}

		return this.room ? this.room.id === roomId : false;
	}

	isRoomOpen( roomId: number )
	{
		return !!this.openRooms[ roomId ];
	}
}
