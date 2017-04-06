angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'auth.join', {
		url: '^/join',
		controller: 'Auth.JoinCtrl',
		controllerAs: 'joinCtrl',
		templateUrl: '/auth/views/auth/join/join.html',
		resolve: {

			// Requiring authPayload waits for the auth resolve.
			// This way the App.user is loaded in and we can check it.
			init: function( $state, $q, App, authPayload )
			{
				// Redirect if logged in.
				if ( App.user ) {
					App.redirectDashboard();

					// Rejecting will make it wait until we redirect and not flash anything halfway.
					return $q.reject();
				}
			}
		},
	} );
} );
