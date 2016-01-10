angular.module( 'App.Invite', [] ).run( function( $rootScope, Invite )
{
	// We only check on first load of the site for an ?invite referrer.
	// This is because they should only get to that URL on first site load.
	// This will set the invite referrer in their server session that can be used
	// on sign up to flag that they were referred by a particular user.
	Invite.checkReferrer();
} );
