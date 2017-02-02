angular.module( 'App.Views', [] ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth', {
		abstract: true,
		url: '/auth',
		controller: 'AuthCtrl',
		controllerAs: 'authCtrl',
		templateUrl: require( './auth.html' ),
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'auth' );
			},
			authPayload: function( Api )
			{
				return Api.sendRequest( '/web/auth/get-customized-page' );
			}
		}
	} );
} );
