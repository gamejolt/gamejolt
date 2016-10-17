angular.module( 'App.User.FriendshipsHelper' ).service( 'User_FriendshipsHelper', function( $q, App, User_Friendship, Growls, ModalConfirm )
{
	this.sendRequest = function( targetUser )
	{
		var request = new User_Friendship( { target_user_id: targetUser.id } );

		return request.$save().then( function()
		{
			Growls.success( 'A friend request has been sent to @' + request.target_user.username + '. You\'ll be notified when they accept.', 'Request Sent' );
			return $q.when( request );
		} )
		.catch( function()
		{
			Growls.error( 'Friend request could not be sent.' );
		} );
	};

	this.acceptRequest = function( request )
	{
		return request.$accept().then( function()
		{
			Growls.success( 'You are now friends with @' + request.user.username + '!', 'Request Accepted' );
		} )
		.catch( function()
		{
			Growls.error( 'Unable to accept friend request.' );
		} );
	};

	this.cancelRequest = function( request )
	{
		return $q( function( resolve, reject )
		{
			ModalConfirm.show( 'Cancel the friend request you sent to @' + request.target_user.username + '?', null, 'yes' ).then( function()
			{
				request.$remove().then( function( response )
				{
					Growls.success( 'Your friend request to @' + request.target_user.username + ' was canceled.', 'Request Canceled' );
					resolve( response );
				} )
				.catch( function( response )
				{
					Growls.error( 'Unable to cancel friend request.' );
					reject( response );
				} );
			} )
			.catch( function()
			{
				// Canceled operation in modal.
				reject();
			} );
		} );
	};

	this.rejectRequest = function( request )
	{
		return $q( function( resolve, reject )
		{
			ModalConfirm.show( 'Dismiss the friend request from @' + request.user.username + '?' ).then( function()
			{
				request.$remove().then( function( response )
				{
					Growls.success( 'You have dismissed the friend request from @' + request.user.username + '.', 'Request Dismissed' );
					resolve( response );
				} )
				.catch( function( response )
				{
					Growls.error( 'Unable to dismiss friend request.' );
					reject( response );
				} );
			} )
			.catch( function()
			{
				// Canceled operation in modal.
				reject();
			} );
		} );
	};

	this.removeFriend = function( friendship )
	{
		return $q( function( resolve, reject )
		{
			var them = friendship.getThem( App.user );

			ModalConfirm.show( 'Remove @' + them.username + ' as a friend?' ).then( function()
			{
				friendship.$remove().then( function( response )
				{
					Growls.success( '@' + them.username + ' is no longer your friend.', 'Friend Removed' );
					resolve( response );
				} )
				.catch( function( response )
				{
					Growls.error( 'Unable to remove friend.' );
					reject( response );
				} );
			} )
			.catch( function()
			{
				// Canceled operation in modal.
				reject();
			} );
		} );
	};
} );
