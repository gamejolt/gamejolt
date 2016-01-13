angular.module( 'App.Chat' ).factory( 'ChatClient', function( $window, $timeout, $interval, $rootScope, $injector, $q, Environment, ChatConfig, Primus, Chat_UserCollection, Chat_RoomStorage, Growls )
{
	function ChatClient( options )
	{
		options = _.defaults( options || {}, {

			// Single room mode should only allow a single room to be
			// open at any one time.
			forceSingleRoomMode: false,
		} );

		this.connected = false;
		this.spark = null;
		this.allCount = 0;
		this.publicRooms = [];
		this.forceSingleRoomMode = options.forceSingleRoomMode;

		this.primus = null;

		// Initialize Primus.
		this._reset();
		this.initPrimus();
	}

	ChatClient.prototype._reset = function()
	{
		this.startTime = Date.now();

		this.currentUser = null;
		this.friendsList = new Chat_UserCollection( Chat_UserCollection.TYPE_FRIEND );
		this.friendsPopulated = false;

		this.room = null;

		// The following are indexed by roomId
		this.messages = {};
		this.usersOnline = {};
		this.notifications = {};
		this.openRooms = {};
		this.pmUsers = {};

		this.messageQueue = [];
		this.sendingMessage = false;
	};

	ChatClient.prototype.reconnect = function()
	{
		this._reset();

		if ( this.spark ) {

			// This disconnects but tells primus to allow the reconnect behavior to kick in.
			this.spark.end( undefined, { reconnect: true } );
		}
	};

	ChatClient.prototype.logOut = function()
	{
		this.reconnect();

		$rootScope.$emit( 'Chat.logOut' );
	};

	/**
	 * Initializes Primus and sets up our event watching.
	 */
	ChatClient.prototype.initPrimus = function()
	{
		var _this = this;

		// Environment.chatHost
		Primus.createConnection( Environment.chatHost ).then( function( primus )
		{
			_this.primus = primus;

			// On new connection or reconnection.
			_this.primus.on( 'open', function( spark )
			{
				// Cap it at a max of 60s.
				var ms = Date.now() - _this.startTime;
				$injector.get( 'Analytics' ).trackTiming( 'chat', 'spark-open', Math.min( ms, 60000 ) );

				_this.spark = spark;

				// We also need to reset all the chat stuff, in case there was a disconnect
				// We need to split this up, because rooms can be rejoined and we don't want to stop that.
				// _this._reset();

				// We set the cookie. This will kick the server to get the information we need for chatting as this user.
				_getCookie( 'frontend' )
					.then( function( cookie )
					{
						_this.primus.write( { event: 'set-cookie', cookie: cookie } );
					} );
			} );

			// On any message...
			_this.primus.on( 'data', function( msg )
			{
				console.log( msg );
				// We want to make sure any changes in these function get digested.
				$rootScope.$apply( function()
				{
					_this._processMessage( msg );
				} );
			} );
		} );
	};

	ChatClient.prototype.setRoom = function( newRoom, options )
	{
		options = _.extend( options || {}, {
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
			this.friendsList.touchRoom( this.room.id );
		}

		if ( newRoom ) {
			if ( this.currentUser ) {
				this.primus.write( { event: 'room-focus', roomId: newRoom.id } );
			}
			this.friendsList.touchRoom( newRoom.id );
		}

		if ( newRoom && this.isGroupRoom( newRoom ) ) {
			delete this.notifications[ newRoom.id ];
			$rootScope.$emit( 'Chat.notificationsUpdated' );
		}

		this.room = newRoom;
	};

	ChatClient.prototype.newNotification = function( roomId )
	{
		if ( this.room && this.room.id == roomId ) {

		}
		else {
			if ( this.notifications[ roomId ] ) {
				this.notifications[ roomId ] = this.notifications[ roomId ] + 1;
			}
			else {
				this.notifications[ roomId ] = 1;
			}
		}

		$rootScope.$emit( 'Chat.notificationsUpdated' );
	};

	function _getCookie( name )
	{
		return $q( function( resolve, reject )
		{
			// Within Client we have to access it this way.
			if ( Environment.isClient ) {
				var gui = require( 'nw.gui' );
				var win = gui.Window.get();
				win.cookies.get( {
					url: 'game-jolt-client',
					name: name,
				},
				function( cookieData )
				{
					if ( !cookieData ) {
						resolve( null );
						return;
					}
					resolve( cookieData.value );
				} );
			}
			else {
				var i,x,y,ARRcookies=document.cookie.split(";");
				for (i=0;i<ARRcookies.length;i++) {
					x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
					y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
					x=x.replace(/^\s+|\s+$/g,"");
					if (x==name) {
						resolve( unescape(y) );
					}
				}
			}
		} );
	}

	/**
	 * isSource is whether or not we opened it in this session.
	 * If it's false, then it may have been opened through another session and we just want it to show in our rooms list.
	 */
	ChatClient.prototype.enterRoom = function( roomId, isSource )
	{
		if ( this.room && this.room.id == roomId ) {
			this.minimizeRoom();
		}
		else {
			if ( roomId && !this.openRooms[roomId] ) {

				// Only allow a certain number of tabs to be open at once.
				if ( _.size( this.openRooms ) >= ChatConfig.MAX_NUM_TABS ) {
					Growls.error( 'You can only have ' + ChatConfig.MAX_NUM_TABS + ' chat tabs open at once.', 'Too Many Chats' );
					return;
				}

				this.primus.write( {
					event: 'enter-room',
					roomId: roomId,
					isSource: isSource || false,
				} );

				$rootScope.$emit( 'Chat.joinRoom', {
					roomId: roomId,
					isSource: isSource || false
				} );
			}
			else {
				this.maximizeRoom( roomId );
			}

			// If we opened this room in this session explicitly, make sure the right pane is visible.
			if ( isSource && !$injector.get( 'Shell' ).isRightPaneVisible ) {
				$injector.get( 'Shell' ).toggleRightPane();
			}
		}
	};

	ChatClient.prototype.leaveRoom = function( roomId )
	{
		if ( roomId && this.openRooms[roomId] ) {
			this.primus.write( {
				event: 'leave-room',
				roomId: roomId,
			} );

			$rootScope.$emit( 'Chat.leaveRoom', {
				roomId: roomId,
			} );
		}
	};

	ChatClient.prototype.maximizeRoom = function( roomId )
	{
		if ( this.openRooms[roomId] ) {
			this.setRoom( this.openRooms[ roomId ] );
		}
	};

	ChatClient.prototype.minimizeRoom = function()
	{
		this.setRoom( null );
	};

	/**
	 * Queues up a message to be sent out.
	 * @param {string} message
	 */
	ChatClient.prototype.queueMessage = function( message )
	{
		// Trim the message of whitespace.
		message = message.replace( /^\s+/, '' ).replace( /\s+$/, '' );

		if ( message === '' ) {
			return;
		}

		this.messageQueue.push( message );
		this._sendNextMessage();
	}

	ChatClient.prototype.outputMessage = function( roomId, type, message, isPrimer )
	{
		if ( this.openRooms[ roomId ] ) {

			message.type = type;
			message.loggedOn = new Date( message.loggedOn );
			message.combine = false;

			if ( this.messages[ roomId ].length ) {
				var latestMessage = _.last( this.messages[ roomId ] );

				// Combine if the same user and within 5 minutes of their previous message.
				if ( message.userId == latestMessage.userId && message.loggedOn.getTime() - latestMessage.loggedOn.getTime() <= 5 * 60 * 1000 ) {
					message.combine = true;
				}
			}

			if ( this.room && this.room.id == roomId) {

			}
			else {
				if ( !this.isPrivateRoom( this.openRooms[ roomId ] ) && !isPrimer ) {
					this.newNotification( roomId );
				}
			}

			// Push it into the room's message list.
			this.messages[ roomId ].push( message );

			// If we are over our max message count, then remove older messages.
			if ( this.messages[ roomId ].length > ChatConfig.MAX_NUM_MESSAGES ) {
				this.messages[ roomId ].splice( 0, 1 );  // Just remove the oldest.
			}
		}
	};

	ChatClient.prototype._processMessage = function( msg )
	{
		/**
		 * Will be called when the user is ready to chat (set-cookie must be sent by us before this fired).
		 *
		 * string `event` 'connected'
		 * object `payload`
		 */
		if ( msg.event === 'connected' ) {

			// Cap it at a max of 60s.
			var ms = Date.now() - this.startTime;
			$injector.get( 'Analytics' ).trackTiming( 'chat', 'connected', Math.min( ms, 60000 ) );

			var lastRoomId = this.room ? this.room.id : null;

			this.currentUser = msg.data.user;
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

			this.setRoom( null );

			if ( !this.singleRoomMode ) {
				Chat_RoomStorage.init();
				Chat_RoomStorage.getJoinedRooms().forEach( function( roomId )
				{
					this.enterRoom( roomId, roomId == lastRoomId);
				}, this );
			}
			else {
				Chat_RoomStorage.destroy();
			}

			$rootScope.$emit( 'Chat.connected', {} );
		}
		else if ( msg.event === 'friends-list' ) {

			var friendsList = msg.data.friendsList;
			if ( friendsList ) {

				this.friendsList = new Chat_UserCollection( Chat_UserCollection.TYPE_FRIEND, friendsList );
				this.friendsPopulated = true;
				$rootScope.$emit( 'Chat.friendsListUpdated', {} );
			}
		}
		else if ( msg.event === 'public-rooms' ) {
			this.publicRooms = msg.data.rooms;
		}
		else if ( msg.event === 'notifications' ) {
			this.notifications = msg.data.notifications;
			$rootScope.$emit( 'Chat.notificationsUpdated' );
		}
		else if ( msg.event === 'message' ) {
			var message = msg.data.message;

			this._processNewOutput( [ message ], false );

			// TODO Old functionality, change this later on. This was for checking if the message was sent successfully or not.
			this.sendingMessage = false;

			// You would have to receive confirmation that your last message was sent before sending your new one.
			if ( this.messageQueue.length ) {
				this._sendNextMessage();
			}

			$rootScope.$emit( 'Chat.message', message );
		}
		else if ( msg.event === 'notification' ) {
			var message = msg.data.message;

			// We got a notification for some room.
			// If the notification key is null, set it to 1.
			this.newNotification( message.roomId );

			// Gotta update the user if it was a friend room.
			this.friendsList.touchRoom( message.roomId );

			$rootScope.$emit( 'Chat.notification', message, this.notifications[ message.roomId ] );
		}
		else if ( msg.event === 'clear-notifications' ) {
			var roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] ) {
				delete this.notifications[ roomId ];

				// Gotta update the user if it was a friend room.
				this.friendsList.touchRoom( roomId );

				$rootScope.$emit( 'Chat.notificationsUpdated' );
			}
		}
		else if ( msg.event === 'user-enter-room' ) {
			var user = msg.data.user;
			var roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] && this.isGroupRoom( this.openRooms[ roomId ] ) ) {
				this.usersOnline[ roomId ].add( user );
			}
		}
		else if ( msg.event === 'user-leave-room' ) {
			var userId = msg.data.userId;
			var roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] && this.isGroupRoom( this.openRooms[ roomId ] ) ) {
				this.usersOnline[ roomId ].remove( userId );
			}
		}
		else if ( msg.event === 'user-muted' ) {
			var userId = msg.data.userId;
			var roomId = msg.data.roomId;
			var isGlobal = msg.data.isGlobal;
			var room = this.openRooms[ roomId ];

			if ( room && this.isGroupRoom( room ) ) {

				// Remove their messages from view.
				if ( this.messages[ roomId ].length ) {
					_.remove( this.messages[ roomId ], { userId: userId } );
				}

				// Mark that they're muted in the user list of the room.
				if ( this.usersOnline[ roomId ] ) {
					this.usersOnline[ roomId ].mute( userId, isGlobal );
				}
			}
		}
		else if ( msg.event === 'user-unmuted' ) {
			var userId = msg.data.userId;
			var roomId = msg.data.roomId;
			var room = this.openRooms[ roomId ];

			if ( room && this.isGroupRoom( room ) ) {

				// Mark that they're unmuted in the user list of the room.
				if ( this.usersOnline[ roomId ] ) {
					this.usersOnline[ roomId ].unmute( userId, isGlobal );
				}
			}
		}
		else if ( msg.event == 'role-set' ) {
			var userId = msg.data.userId;
			var roomId = msg.data.roomId;
			var action = msg.data.action;
			var room = this.openRooms[ roomId ];

			if ( room && this.isGroupRoom( room ) && this.usersOnline[ roomId ] ) {
				if ( action == 'mod' ) {
					this.usersOnline[ roomId ].mod( userId );
				}
				else if ( action == 'demod' ) {
					this.usersOnline[ roomId ].demod( userId );
				}
			}
		}
		else if ( msg.event === 'message-cleared' ) {
			var messageId = msg.data.messageId;
			var roomId = msg.data.roomId;
			// TODO
		}
		else if ( msg.event === 'room-cleared' ) {
			var roomId = msg.data.roomId;
			// TODO
		}
		else if ( msg.event === 'prime-chatroom' ) {
			var room = msg.data.room;
			var messages = msg.data.messages;
			var users = msg.data.users;
			var isSource = msg.data.isSource;

			// Primed messages are loaded in descending order w.r.t. id, lets make that ascending
			messages.reverse();
			this._joinRoom( room, messages, users, isSource );
		}

		else if ( msg.event === 'room-updated' ) {
			var room = msg.data.room;
		}
		else if ( msg.event === 'you-updated' ) {
			var newUser = msg.data.user;

			this.currentUser = newUser;
		}
		else if ( msg.event === 'user-updated' ) {
			var roomId = msg.data.roomId;
			var user = msg.data.user;

			if ( this.openRooms[ roomId ] && this.isGroupRoom( this.openRooms[ roomId ] ) ) {
				this.usersOnline[ roomId ].update( user );
			}
		}
		else if ( msg.event === 'friend-updated' ) {
			var user = msg.data.user;

			this.friendsList.update( user );
		}
		else if ( msg.event === 'friend-add' ) {
			var user = msg.data.user;

			this.friendsList.add( user );
			$rootScope.$emit( 'Chat.friendsListUpdated', {} );
		}
		else if ( msg.event === 'friend-remove' ) {
			var userId = msg.data.userId;

			// Delete their room

			var friend = this.friendsList.get( userId );
			if ( friend ) {
				this.leaveRoom( friend.roomId );
			}

			this.friendsList.remove( userId );
			$rootScope.$emit( 'Chat.friendsListUpdated', {} );
		}
		else if ( msg.event === 'friend-online' ) {
			var user = msg.data.user;

			this.friendsList.online( user );
			$rootScope.$emit( 'Chat.friendsListUpdated', {} );
			$rootScope.$emit( 'Chat.friendOnline', user.id );
		}
		else if ( msg.event === 'friend-offline' ) {
			var userId = msg.data.userId;

			this.friendsList.offline( userId );
			$rootScope.$emit( 'Chat.friendsListUpdated', {} );
			$rootScope.$emit( 'Chat.friendOffline', userId );
		}
		else if ( msg.event === 'you-leave-room' ) {
			var roomId = msg.data.roomId;

			if ( this.openRooms[ roomId ] ) {
				if ( this.room && this.room.id == roomId ) {

					// Sending an unfocus event while we're not in the room results in an error.
					this.setRoom( null, { sendUnfocusEvent: false } );
				}

				// If there was a PM'd user before, let's update the status so it doesn't show their room is open anymore
				if ( this.pmUsers[roomId] ) {
					this.friendsList.touchRoom( roomId );
				}

				// Reset the room we were in
				delete this.usersOnline[roomId];
				delete this.openRooms[roomId];
				delete this.messages[roomId];
				delete this.pmUsers[roomId];
			}
		}
		else if ( msg.event === 'online-count' ) {
			this.allCount = msg.data.onlineCount;
		}
	};

	ChatClient.prototype._joinRoom = function( room, messages, users, isSource )
	{
		if ( !this.room || this.room.id !== room.id ) {
			if ( room.type === ChatConfig.ROOM_PM ) { // We need to rename the room to the username

				var friend = this.friendsList.getByRoom( room.id );
				if ( friend ) {
					room.user = friend;
				}
			}

			// Set the room info
			this.openRooms[ room.id ] = room;
			this.messages[ room.id ] = [];

			if ( this.isGroupRoom( room ) ) {
				this.usersOnline[ room.id ] = new Chat_UserCollection( Chat_UserCollection.TYPE_ROOM, users );

				this.refreshModStates();
				this.refreshMutedStates();
			}
			else if ( this.isPMRoom( room ) ) {

				// Since we cleared notifications, gotta touch them.
				this.friendsList.touchRoom( room.id );
			}

			this._processNewOutput( messages, true );

			// If isSource is true, that means that this client actually opened the room
			// so we open it here. In the other clients we don't.
			if ( isSource ) {
				this.setRoom( room );
			}

			$rootScope.$emit( 'Chat.notificationsUpdated' );
		}
	};

	ChatClient.prototype.mod = function( userId, roomId )
	{
		this.primus.write( { event: 'user-mod', userId: userId, roomId: roomId } );
	};

	ChatClient.prototype.demod = function( userId, roomId )
	{
		this.primus.write( { event: 'user-demod', userId: userId, roomId: roomId } );
	};

	ChatClient.prototype.mute = function( userId, roomId )
	{
		this.primus.write( { event: 'user-mute', userId: userId, roomId: roomId } );
	};

	ChatClient.prototype.unmute = function( userId, roomId )
	{
		this.primus.write( { event: 'user-unmute', userId: userId, roomId: roomId } );
	};

	ChatClient.prototype._processNewOutput = function( messages, isPrimer )
	{
		if ( !messages.length ) {
			return;
		}

		angular.forEach( messages, function( msg )
		{
			this.outputMessage( msg.roomId, ChatConfig.MSG_NORMAL, msg, isPrimer );

			// Emit an event that we've sent out a new message.
			$rootScope.$emit( 'Chat.newMessage', { message: msg, isPrimer: isPrimer } );
		}, this );
	};

	ChatClient.prototype._sendNextMessage = function()
	{
		if ( this.sendingMessage ) {
			return;
		}

		this.sendingMessage = true;
		var message = this.messageQueue.shift();

		if ( !message ) {
			this.sendingMessage = false;
			return;
		}

		if ( this.checkRoomMutedState( this.room.id ) ) {
			this.sendRoboJolt( this.room.id, '*Beep boop bop.* You are muted and cannot talk. Please read the chat rules for every room you enter so you may avoid this in the future. *Bzzzzzzzzt.*' );
			this.sendingMessage = false;
			return;
		}

		// Send the message to the server. The server will send a callback response on whether or not it was successful.
		this.primus.write( { event: 'message', content: message, roomId: this.room.id } );
	}

	ChatClient.prototype.sendRoboJolt = function( roomId, messageContent )
	{
		var message = {
			id: Math.random(),
			type: ChatConfig.MSG_SYSTEM,
			userId: 192757,
			user: {
				id: 192757,
				username: 'robo-jolt-2000',
				displayName: 'RoboJolt 2000',
				imgAvatar: 'https://secure.gravatar.com/avatar/eff6eb6a79a34774e8f94400931ce6c9?s=200&r=pg&d=https%3A%2F%2Fb6d3e9q9.ssl.hwcdn.net%2Fimg%2Fno-avatar-3.png',
			},
			roomId: roomId,
			content: messageContent,
			loggedOn: Date.now(),
		};

		this.outputMessage( roomId, ChatConfig.MSG_SYSTEM, message, false );
	};

	ChatClient.prototype.canModerate = function( room, targetUser, action )
	{
		if ( !this.currentUser ) {
			return false;
		}

		// No one can moderate site mods.
		if ( targetUser.permissionLevel >= ChatConfig.SITE_MOD_PERMISSION ) {
			return false;
		}

		// Site mods can moderate everyone else.
		if ( this.currentUser.permissionLevel >= ChatConfig.SITE_MOD_PERMISSION ) {
			return true;
		}

		if ( !room.isMod ) {
			return false;
		}

		if ( room.isMod == 'owner' && targetUser.isMod != 'owner' ) {
			return true;
		}

		// Must be an owner or higher to mod someone else.
		if ( action == 'mod' ) {
			return false;
		}

		if ( room.isMod == 'moderator' && !targetUser.isMod ) {
			return true;
		}

		return false;
	};

	ChatClient.prototype.refreshModStates = function()
	{
		// Guest
		if ( !this.currentUser ) {
			return;
		}

		angular.forEach( this.openRooms, function( room, roomId )
		{
			if ( !this.isGroupRoom( room ) ) {
				return;
			}

			var us = this.usersOnline[ roomId ].get( this.currentUser.id );
			if ( us ) {
				room.isMod = us.isMod || false;
			}
		}, this );
	};

	ChatClient.prototype.refreshMutedStates = function()
	{
		// Guest
		if ( !this.currentUser ) {
			return;
		}

		angular.forEach( this.openRooms, function( room, roomId )
		{
			if ( !this.isGroupRoom( room ) ) {
				return;
			}

			var us = this.usersOnline[ roomId ].get( this.currentUser.id );
			if ( us ) {
				room.isMutedGlobal = !!us.isMutedGlobal;
				room.isMutedRoom = !!us.isMutedRoom;
			}
		}, this );
	};

	ChatClient.prototype.checkRoomMutedState = function( roomId )
	{
		// Guest
		if ( !this.currentUser ) {
			return false;
		}

		var room = this.openRooms[ roomId ];
		if ( !room || !this.isGroupRoom( room ) ) {
			return false;
		}

		return room.isMutedGlobal || room.isMutedRoom;
	};

	ChatClient.prototype.isPMRoom = function( room )
	{
		return !!room ? room.type === ChatConfig.ROOM_PM : false;
	};

	ChatClient.prototype.isPrivateRoom = function( room )
	{
		return !!room ? room.type === ChatConfig.ROOM_PM || room.type === ChatConfig.ROOM_CLOSED_GROUP : false;
	};

	ChatClient.prototype.isGroupRoom = function( room )
	{
		return !!room ? room.type === ChatConfig.ROOM_OPEN_GROUP || room.type === ChatConfig.ROOM_CLOSED_GROUP || room.type === ChatConfig.ROOM_VIRAL_GROUP : false;
	};

	ChatClient.prototype.hasOpenRooms = function()
	{
		return Object.keys( this.openRooms ).length > 0;
	};

	ChatClient.prototype.isInRoom = function( roomId )
	{
		if ( !roomId ) {
			return !!this.room;
		}

		return this.room ? this.room.id == roomId : false;
	};

	ChatClient.prototype.isRoomOpen = function( roomId )
	{
		return !!this.openRooms[ roomId ];
	};

	return ChatClient;
} );
