angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.forgot', {
		url: '^/forgot',
		controller: 'Auth.ForgotCtrl',
		controllerAs: 'forgotCtrl',
		templateUrl: '/auth/views/auth/forgot/forgot.html',
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
