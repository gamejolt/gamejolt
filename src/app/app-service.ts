export class App
{
	ver: number = null;
	title = '';
	user: any = null;
	userBootstrapped = false;

	constructor( $rootScope, private $state, private $injector, private $q, private Chat, private ModalConfirm, private Growls )
	{
		// Payload emits this every time the user is processed.
		// We want to store whether or not we've bootstrapped the user yet so we can hide things
		// that depend on the user being loaded in.
		$rootScope.$on( 'Payload.userProcessed', () =>
		{
			if ( !this.userBootstrapped ) {
				this.userBootstrapped = true;
			}
		} );

		// Connect to chat.
		Chat.connect();
	}

	logout()
	{
		return this.$q( ( resolve, reject ) =>
		{
			this.ModalConfirm.show( 'Are you seriously going to leave us?', 'Really?', 'yes' ).then( __ =>
			{
				// Must send POST.
				this.$injector.get( 'Api' ).sendRequest( '/web/dash/account/logout', {} ).then( __ =>
				{
					// We go to the homepage currently just in case they're in a view they shouldn't be.
					this.$state.go( 'discover.home' );

					// Log out of chat. This will notify other tabs to disconnect from the server too.
					this.Chat.client.logOut();

					this.Growls.success( 'You are now logged out.', 'Goodbye!' );
					resolve();
				} )
				.catch( err =>
				{
					console.error( err );
					this.Growls.error( 'Could not log you out.' );
					reject();
				} );
			} );
		} );
	}
}
