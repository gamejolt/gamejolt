angular.module( 'App.Chat' ).service( 'Chat', function( $ocLazyLoad, $window, $rootScope, $interval, $injector, ChatConfig, ChatClient, Favicon, Environment, Screen )
{
	var _this = this;

	this._documentTitle = $window.document.title;

	this.visible = true;
	this.windowFocused = true;
	this.friendNotifications = 0;
	this.roomNotifications = 0;
	this.totalNotifications = 0;
	this.bootstrappingDefaultRoom = false;

	this.connect = function()
	{
		// Don't connect to chat if we're prerendering.
		if ( Environment.isPrerender ) {
			return;
		}

		_startTime = Date.now();

		// We set it into single-room mode if they opened the device with an XS size.
		_this.client = new ChatClient( { forceSingleRoomMode: Screen.isXs } );

		/**
		* When the sidebar is closed we want to make sure we leave their current active room.
		*/
		$rootScope.$watch( function()
		{
			return $injector.get( 'Shell' ).isRightPaneVisible;
		},
		function( visible )
		{
			// If the chat sidebar is no longer visible, but we are in a room, close it.
			if ( !visible && _this.client.isInRoom() ) {
				_this.client.minimizeRoom();
			}
		} );
	};

	this.reconnect = function()
	{
		this.client.reconnect();
	};

	function updateNotifications()
	{
		var friendNotifications = _.reduce( _this.client.notifications, function( total, cur )
		{
			return total + (cur || 0);
		} );

		_this.friendNotifications = friendNotifications;
		_this.totalNotifications = _this.roomNotifications + friendNotifications;
		if ( _this.totalNotifications ) {
			Favicon.badge( _this.totalNotifications );
		}
		else {
			Favicon.reset();
		}
	};

	/**
	 * When the window is unfocused, start counting notifications for current room.
	 */
	angular.element( $window ).on( 'blur', function()
	{
		// Set that we're no longer focused on the window.
		// We'll start incrementing the room notifications count since
		// we're not "seeing" the messages right now.
		_this.windowFocused = false;
	} );

	/**
	 * When the window is refocused, clear out current window's notifications.
	 */
	angular.element( $window ).on( 'focus', function()
	{
		// Set that we're not longer focused, and clear out room notifications.
		// The user has now "seen" the messages.
		_this.windowFocused = true;
		_this.roomNotifications = 0;

		// Keep the title count up to date.
		updateNotifications();
	} );

	$rootScope.$on( 'Chat.newMessage', function( event, data )
	{
		// If we have a general room open, and our window is unfocused or minimized,
		// then increment our room notifications count (since they haven't seen this message yet).
		// Note that if these messages came in because we were priming output for a room with old messages,
		// we don't want to increase notification counts.
		if ( !_this.windowFocused && _this.client.room ) {
			if ( !data.isPrimer && data.message && data.message.roomId == _this.client.room.id ) {
				++_this.roomNotifications;
				updateNotifications();
			}
		}
	} );

	$rootScope.$on( 'Chat.notificationsUpdated', updateNotifications );
} );
