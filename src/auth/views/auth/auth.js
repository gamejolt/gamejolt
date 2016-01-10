angular.module( 'App.Views', [] ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth', {
		abstract: true,
		url: '/auth',
		controller: 'AuthCtrl',
		controllerAs: 'authCtrl',
		templateUrl: '/auth/views/auth/auth.html',
		resolve: {
			init: function( Translate )
			{
				// Bootstrap the translation for this module.
				return Translate.addParts( 'auth' );
			},
			authPayload: function( Api )
			{
				return Api.sendRequest( '/web/auth/get-customized-page' );
			}
		}
	} );
} );
