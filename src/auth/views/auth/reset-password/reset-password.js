angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.reset-password', {
		url: '^/reset-password/:userId/:key',
		controller: 'Auth.ResetPasswordCtrl',
		controllerAs: 'resetPasswordCtrl',
		templateUrl: '/auth/views/auth/reset-password/reset-password.html',
		resolve: {
			payload: function( $stateParams, Api )
			{
				// Will return a 404 if the key isn't correct for this user.
				return Api.sendRequest( '/web/auth/check-reset-key/' + $stateParams.userId, { key: $stateParams.key } );
			}
		},
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
