angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.forgot', {
		url: '^/forgot',
		controller: 'Auth.ForgotCtrl',
		controllerAs: 'forgotCtrl',
		templateUrl: require( './forgot.html' ),
		onEnter: function( App )
		{
			App.shouldShowCoverImage = false;
		},
		onExit: function( App )
		{
			App.shouldShowCoverImage = true;
		}
	} );
} );
