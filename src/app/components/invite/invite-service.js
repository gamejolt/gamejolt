angular.module( 'App.Invite' ).service( 'Invite', function( $location, Api )
{
	this.checkReferrer = function()
	{
		var search = $location.search();
		if ( search && search['invite'] ) {

			// Gotta store the invite referrer in their session.
			this.setInviteReferrer( search['invite'] );
		}
	};

	this.setInviteReferrer = function( invite )
	{
		return Api.sendRequest( '/web/auth/set-invite-referrer/' + invite, {}, { detach: true } );
	};
} );
