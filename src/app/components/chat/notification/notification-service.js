angular.module( 'App.Chat' )
.run( function( Chat_Notification )
{
	Chat_Notification.init();
} )
.service( 'Chat_Notification', function( $rootScope, $timeout, Growls, Chat, App )
{
	var _this = this;

	// How long to wait before showing the friend online/offline message.
	// This allows us to not flash online/offline messages when they refresh browser.
	var FRIEND_CONNECTION_WAIT = 5000;

	this.friendConnectionPromises = {};
	this.friendConnectionStates = {};

	this.init = function()
	{
		// For testing.
		// $interval( function()
		// {
		// 	if ( Math.random() > 0.5 ) {
		// 		$rootScope.$emit( 'Chat.friendOnline', 14546 );
		// 	}
		// 	if ( Math.random() > 0.5 ) {
		// 		$rootScope.$emit( 'Chat.friendOffline', 14546 );
		// 	}
		// }, 6000 );

		$rootScope.$on( 'Chat.notification', function( event, message, notificationCount )
		{
			if ( !Chat.client.room || !Chat.client.openRooms[ message.roomId ] ) {
				Growls.info( {
					title: message.user.displayName,
					message: message.contentRaw,  // Use the raw message so we don't show compiled markdown.
					icon: message.user.imgAvatar,
					onclick: function( e )
					{
						Chat.client.enterRoom( message.roomId, true );
					},
				} );
			}
		} );

		$rootScope.$on( 'Chat.friendOnline', function( event, userId )
		{
			_this.friendConnection( userId, true, function( friend )
			{
				Growls.info( {
					title: friend.displayName + ' Online',
					message: friend.displayName + ' just got online.',
					icon: friend.imgAvatar,
					onclick: function( e )
					{
						Chat.client.enterRoom( friend.roomId, true );
					},
				} );
			} );
		} );

		$rootScope.$on( 'Chat.friendOffline', function( event, userId )
		{
			_this.friendConnection( userId, false, function( friend )
			{
				Growls.info( {
					title: friend.displayName + ' Offline',
					message: friend.displayName + ' just went offline.',
					icon: friend.imgAvatar,
					onclick: function( e )
					{
						Chat.client.enterRoom( friend.roomId, true );
					},
				} );
			} );
		} );
	};

	this.friendConnection = function( userId, isOnline, fn )
	{
		var friend = Chat.client.friendsList.get( userId );
		if ( !friend ) {
			return;
		}

		// We store the new state of the friend before doing the whole promise chain.
		if ( angular.isUndefined( this.friendConnectionStates[ userId ] ) ) {
			this.friendConnectionStates[ userId ] = isOnline;
		}

		var promise = this.friendConnectionPromises[ userId ];
		if ( promise ) {
			$timeout.cancel( promise );
			delete this.friendConnectionPromises[ userId ];
		}

		this.friendConnectionPromises[ userId ] = $timeout( function()
		{
			// We only alert if the new state is the same as the one we had wanted to alert
			// on at the beginning of the chain.
			// This way if they are offline, then quickly online -> offline, we don't alert since
			// we had tried to go online, but then we changed to offline, which is a different state
			// than we had initially tried to transition to.
			if ( _this.friendConnectionStates[ userId ] === isOnline ) {
				fn( friend );
			}

			delete _this.friendConnectionPromises[ userId ];
			delete _this.friendConnectionStates[ userId ];

		}, FRIEND_CONNECTION_WAIT );
	};
} );
