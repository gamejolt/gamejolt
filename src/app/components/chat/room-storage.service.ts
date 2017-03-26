import { Chat } from './chat.service';

const STORAGE_KEY = 'chat-room-storage:rooms';

export class ChatRoomStorage
{
	static joinRoomEvent = null;
	static leaveRoomEvent = null;
	static logOutEvent = null;
	static storageListener?: EventListener ;

	static init()
	{
		// if ( !this.joinRoomEvent ) {
		// 	joinRoomEvent = $rootScope.$on( 'Chat.joinRoom', function( event, data )
		// 	{
		// 		_this.onJoinRoom( data.roomId );
		// 	} );
		// }

		// if ( !leaveRoomEvent ) {
		// 	leaveRoomEvent = $rootScope.$on( 'Chat.leaveRoom', function( event, data )
		// 	{false
		// 		_this.onLeaveRoom( data.roomId );
		// 	} );
		// }

		// if ( !logOutEvent ) {
		// 	logOutEvent = $rootScope.$on( 'Chat.logOut', function( event, data )
		// 	{
		// 		_this.onLogOut();
		// 	} );
		// }

		if ( !window.localStorage.getItem( STORAGE_KEY ) ) {
			window.localStorage.setItem( STORAGE_KEY, JSON.stringify ( {
				action: null,
				rooms: [],
			} ) );
		}

		if ( !this.storageListener ) {
			this.storageListener = ( event: StorageEvent ) => this.onStorageEvent( event );
			window.addEventListener( 'storage', this.storageListener );
		}

		this.cleanRooms();
	}

	static cleanRooms()
	{
		const data = JSON.parse( window.localStorage.getItem( STORAGE_KEY ) || '{}' );

		data.rooms = data.rooms.filter( ( roomId: number ) =>
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

		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
	}

	static destroy()
	{
		// if ( joinRoomEvent ) {
		// 	joinRoomEvent();
		// 	joinRoomEvent = null;
		// }

		// if ( leaveRoomEvent ) {
		// 	leaveRoomEvent();
		// 	leaveRoomEvent = null;
		// }

		// if ( logOutEvent ) {
		// 	logOutEvent();
		// 	logOutEvent = null;
		// }

		if ( this.storageListener ) {
			window.removeEventListener( 'storage', this.storageListener );
			this.storageListener = undefined;
		}
	}

	private static onStorageEvent( storageEvent: StorageEvent )
	{
		if ( storageEvent.key !== STORAGE_KEY ) {
			return;
		}

		const roomData = JSON.parse( storageEvent.newValue || '{}' );
		const action = roomData.action;

		if ( !action ) {
			return;
		}

		if ( action.type === 'join' ) {
			Chat.client.enterRoom( action.roomId, false );
		}
		else if ( action.type === 'leave' ) {
			Chat.client.leaveRoom( action.roomId );
		}
		else if ( action.type === 'log-out' ) {
			Chat.client.logout();
		}
	}

	static getJoinedRooms(): number[]
	{
		return JSON.parse( window.localStorage.getItem( STORAGE_KEY ) || '{}' ).rooms;
	}

	// private static onJoinRoom( roomId: number )
	// {
	// 	const data = JSON.parse( window.localStorage.getItem( STORAGE_KEY ) || '{}' );

	// 	// Don't reprocess the same command.
	// 	if ( data.action && data.action.type === 'join' && data.action.roomId === roomId ) {
	// 		return;
	// 	}

	// 	if ( data.rooms.indexOf( roomId ) === -1 ) {
	// 		data.rooms.push( roomId );
	// 		data.time = Date.now();
	// 		data.action = {
	// 			type: 'join',
	// 			roomId: roomId,
	// 		};

	// 		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
	// 	}
	// }

	// private static onLeaveRoom( roomId: number )
	// {
	// 	const data = JSON.parse( window.localStorage.getItem( STORAGE_KEY ) || '{}' );

	// 	// Don't reprocess the same command.
	// 	if ( data.action && data.action.type === 'leave' && data.action.roomId === roomId ) {
	// 		return;
	// 	}

	// 	const roomIndex = data.rooms.indexOf( roomId );
	// 	if ( roomIndex !== -1 ) {
	// 		data.rooms = data.rooms.filter( ( roomId2: number ) => roomId !== roomId2 );
	// 		data.time = Date.now();
	// 		data.action = {
	// 			type: 'leave',
	// 			roomId: roomId,
	// 		};

	// 		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
	// 	}
	// }

	// private static onLogOut()
	// {
	// 	const data = JSON.parse( window.localStorage.getItem( STORAGE_KEY ) || '{}' );

	// 	data.time = Date.now();
	// 	data.action = {
	// 		type: 'log-out',
	// 	};
	// 	data.rooms = [];

	// 	window.localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );
	// }
}
