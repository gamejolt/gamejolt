import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { Favicon } from '../../../lib/gj-lib-client/components/favicon/favicon.service';
import { ChatClient } from './client';

export class Chat
{
	static readonly MAX_NUM_MESSAGES: 200;
	static readonly MAX_NUM_TABS: 10;
	static readonly SITE_MOD_PERMISSION: 2;

	static client: ChatClient;
	static _documentTitle = window.document.title;

	static visible = true;
	static windowFocused = true;
	static friendNotifications = 0;
	static roomNotifications = 0;
	static unfocusedNotifications = 0;
	static totalNotifications = 0;
	static bootstrappingDefaultRoom = false;

	static connect()
	{
		// Don't connect to chat if we're prerendering.
		if ( Environment.isPrerender ) {
			return;
		}

		// TODO
		// _startTime = Date.now();

		// We set it into single-room mode if they opened the device with an XS size.
		this.client = new ChatClient( { forceSingleRoomMode: Screen.isXs } );

		// /**
		// * When the sidebar is closed we want to make sure we leave their current active room.
		// */
		// $rootScope.$watch( function()
		// {
		// 	return $injector.get( 'Shell' ).isRightPaneVisible;
		// },
		// function( visible )
		// {
		// 	// If the chat sidebar is no longer visible, but we are in a room, close it.
		// 	if ( !visible && this.client.isInRoom() ) {
		// 		this.client.minimizeRoom();
		// 	}
		// } );
	}

	static reconnect()
	{
		this.client.reconnect();
	}

	// private static updateNotifications()
	// {
	// 	this.friendNotifications = 0;
	// 	this.roomNotifications = 0;

	// 	Object.keys( this.client.notifications ).forEach( ( key ) =>
	// 	{
	// 		const cur = this.client.notifications[ key ];

	// 		// Notifications for a room? Increment friend notifications.
	// 		if ( this.client.friendsList.getByRoom( parseInt( key, 10 ) ) ) {
	// 			this.friendNotifications += (cur || 0);
	// 		}

	// 		this.roomNotifications += (cur || 0);
	// 	} );

	// 	this.totalNotifications = this.unfocusedNotifications + this.roomNotifications;
	// 	if ( this.totalNotifications ) {
	// 		Favicon.badge( this.totalNotifications );
	// 	}
	// 	else {
	// 		Favicon.reset();
	// 	}
	// }

	// /**
	//  * When the window is unfocused, start counting notifications for current room.
	//  */
	// angular.element( $window ).on( 'blur', function()
	// {
	// 	// Set that we're no longer focused on the window.
	// 	// We'll start incrementing the room notifications count since
	// 	// we're not "seeing" the messages right now.
	// 	this.windowFocused = false;

	// 	// Notify the client that we are unfocused, so it should start accumulating notifications for the current room.
	// 	this.client.setFocused( false );
	// } );

	// /**
	//  * When the window is refocused, clear out current window's notifications.
	//  */
	// angular.element( $window ).on( 'focus', function()
	// {
	// 	// Set that we're not longer focused, and clear out room notifications.
	// 	// The user has now "seen" the messages.
	// 	this.windowFocused = true;
	// 	this.unfocusedNotifications = 0;

	// 	// Notify the client that we aren't unfocused anymore.
	// 	this.client.setFocused( true );

	// 	// Keep the title count up to date.
	// 	updateNotifications();
	// } );

	// $rootScope.$on( 'Chat.newMessage', function( event, data )
	// {
	// 	// If we have a general room open, and our window is unfocused or minimized,
	// 	// then increment our room notifications count (since they haven't seen this message yet).
	// 	// Note that if these messages came in because we were priming output for a room with old messages,
	// 	// we don't want to increase notification counts.
	// 	if ( !this.windowFocused && this.client.room ) {
	// 		if ( !data.isPrimer && data.message && data.message.roomId == this.client.room.id ) {
	// 			++this.unfocusedNotifications;
	// 			updateNotifications();
	// 		}
	// 	}
	// } );

	// $rootScope.$on( 'Chat.notificationsUpdated', updateNotifications );
	// $rootScope.$on( 'Chat.friendsListUpdated', updateNotifications );
}
