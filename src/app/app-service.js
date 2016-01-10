angular.module( 'App' ).service( 'App', function( $rootScope, $state, $injector, $q, Screen, Chat, ModalConfirm, Growls, Backdrop )
{
	var _this = this;

	this.ver = null;
	this.title = '';
	this.user = null;
	this.userBootstrapped = false;

	// Payload emits this every time the user is processed.
	// We want to store whether or not we've bootstrapped the user yet so we can hide things
	// that depend on the user being loaded in.
	$rootScope.$on( 'Payload.userProcessed', function()
	{
		if ( !_this.userBootstrapped ) {
			_this.userBootstrapped = true;
		}
	} );

	// Connect to chat.
	Chat.connect();

	/**
	 * Logs our main App user out.
	 */
	this.logout = function()
	{
		return $q( function( resolve, reject )
		{
			ModalConfirm.show( 'Are you seriously going to leave us?', 'Really?', 'yes' ).then( function()
			{
				// Must send POST.
				$injector.get( 'Api' ).sendRequest( '/web/dash/account/logout', {} ).then( function()
				{
					// We go to the homepage currently just in case they're in a view they shouldn't be.
					$state.go( 'discover.home' );

					// Log out of chat. This will notify other tabs to disconnect from the server too.
					Chat.client.logOut();

					Growls.success( 'You are now logged out.', 'Goodbye!' );
					resolve();
				} )
				.catch( function( err )
				{
					console.error( err );
					Growls.error( 'Could not log you out.' );
					reject();
				} );
			} );
		} );
	};
} );
