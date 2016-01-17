angular.module( 'App.Chat' ).service( 'Chat_RoomStorage', function( $injector, $window, $rootScope )
{
	var STORAGE_KEY = 'chat-room-storage:rooms';

	var joinRoomEvent = null;
	var leaveRoomEvent = null;
	var logOutEvent = null;
	var storageListener = false;

	this.init = function()
	{
		var _this = this;

		this.cleanRooms();

		if ( !joinRoomEvent ) {
			joinRoomEvent = $rootScope.$on( 'Chat.joinRoom', function( event, data )
			{
				_this.onJoinRoom( data.roomId );
			} );
		}

		if ( !leaveRoomEvent ) {
			leaveRoomEvent = $rootScope.$on( 'Chat.leaveRoom', function( event, data )
			{
				_this.onLeaveRoom( data.roomId );
			} );
		}

		if ( !logOutEvent ) {
			logOutEvent = $rootScope.$on( 'Chat.logOut', function( event, data )
			{
				_this.onLogOut();
			} );
		}

		if ( !$window.localStorage.getItem( STORAGE_KEY ) ) {
			$window.localStorage.setItem( STORAGE_KEY, JSON.stringify ( {
				action: null,
				rooms: [],
			} ) );
		}

		if ( storageListener ) {
			$window.addEventListener( 'storage', onStorageEvent );
			storageListener = true;
		}
	};

	this.cleanRooms = function()
	{
		var data = JSON.parse( $window.localStorage.getItem( STORAGE_KEY ) );

		data.rooms = data.rooms.filter( function( roomId )
		{
			if ( !roomId ) {
				return false;
			}
			else {
				return true;
			}
		} );

		data.time = Date.now();
		data.action = {
			type: 'clean'
		};

		$window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
	};

	this.destroy = function()
	{
		if ( joinRoomEvent ) {
			joinRoomEvent();
			joinRoomEvent = null;
		}

		if ( leaveRoomEvent ) {
			leaveRoomEvent();
			leaveRoomEvent = null;
		}

		if ( logOutEvent ) {
			logOutEvent();
			logOutEvent = null;
		}

		if ( storageListener ) {
			$window.removeEventListener( 'storage', onStorageEvent );
			storageListener = false;
		}
	};

	function onStorageEvent( storageEvent )
	{
		if ( storageEvent.key != STORAGE_KEY ) {
			return;
		}

		var roomData = JSON.parse( storageEvent.newValue );
		var action = roomData.action;

		if ( !action ) {
			return;
		}

		if ( action.type === 'join' ) {
			$injector.get( 'Chat' ).client.enterRoom( action.roomId, false );
		}
		else if ( action.type === 'leave' ) {
			$injector.get( 'Chat' ).client.leaveRoom( action.roomId );
		}
		else if ( action.type === 'log-out' ) {
			$injector.get( 'Chat' ).client.logOut();
		}
	}

	this.getJoinedRooms = function()
	{
		return JSON.parse( $window.localStorage.getItem( STORAGE_KEY ) ).rooms;
	};

	this.onJoinRoom = function( roomId )
	{
		var data = JSON.parse( $window.localStorage.getItem( STORAGE_KEY ) );

		// Don't reprocess the same command.
		if ( data.action && data.action.type == 'join' && data.action.roomId == roomId ) {
			return;
		}

		if ( data.rooms.indexOf( roomId ) === -1 ) {
			data.rooms.push( roomId );
			data.time = new Date.now();
			data.action = {
				type: 'join',
				roomId: roomId,
			};

			$window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
		}
	};

	this.onLeaveRoom = function( roomId )
	{
		var data = JSON.parse( $window.localStorage.getItem( STORAGE_KEY ) );

		// Don't reprocess the same command.
		if ( data.action && data.action.type == 'leave' && data.action.roomId == roomId ) {
			return;
		}

		var roomIndex = data.rooms.indexOf( roomId );
		if ( roomIndex !== -1 ) {
			data.rooms = data.rooms.filter( function( roomId2 )
			{
				if ( roomId == roomId2 ) {
					return false;
				}
				else {
					return true;
				}
			} );
			data.time = new Date.now();
			data.action = {
				type: 'leave',
				roomId: roomId,
			};

			$window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
		}
	};

	this.onLogOut = function()
	{
		var data = JSON.parse( $window.localStorage.getItem( STORAGE_KEY ) );

		data.time = new Date.now();
		data.action = {
			type: 'log-out',
		};
		data.rooms = [];

		$window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
	};
} );
