angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/auth/authorize/:userId/:code/:type/', '/authorize/:userId/:code/:type' );

	$stateProvider.state( 'auth.authorize', {
		url: '^/authorize/:userId/:code/:type',
		templateUrl: '/auth/views/auth/authorize/authorize.html',
		controller: function( Translate )
		{
			Translate.pageTitle( 'auth.authorize.invalid.page_title' );
		},
		resolve: {
			payload: function( $q, $timeout, $stateParams, $state, Api, App, Translate )
			{
				// Do this in the resolve so that we don't flash the "invalid authorization" message.
				return $q( function( resolve, reject )
				{
					Api.sendRequest( '/web/auth/authorize/' + $stateParams.userId + '/' + $stateParams.code + '/' + $stateParams.type ).then( function( response )
					{
						// Never resolve if it's success.
						if ( response.success ) {
							Translate.growl( 'success', 'auth.authorize.success' );
							$timeout( function()
							{
								App.redirectDashboard();
							}, 3000 );
						}
						else {
							resolve();
						}
					} );
				} );
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
