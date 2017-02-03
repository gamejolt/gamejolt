angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/auth/authorize/:userId/:code/:type/', '/authorize/:userId/:code/:type' );

	$stateProvider.state( 'auth.authorize', {
		url: '^/authorize/:userId/:code/:type',
		templateUrl: require( './authorize.html' ),
		controller: function( App, gettextCatalog )
		{
			/// The title for the page when their authorization fails.
			App.title = gettextCatalog.getString( 'auth.authorize.invalid.page_title' );
		},
		resolve: {
			payload: function( $q, $timeout, $stateParams, $state, Api, App, Growls, gettextCatalog )
			{
				// Do this in the resolve so that we don't flash the "invalid authorization" message.
				return $q( function( resolve, reject )
				{
					Api.sendRequest( '/web/auth/authorize/' + $stateParams.userId + '/' + $stateParams.code + '/' + $stateParams.type ).then( function( response )
					{
						// Never resolve if it's success.
						if ( response.success ) {

							/// You need to actually sign up to get a valid URL for this page.
							/// We only show a Growl on successful authorization and funnel off to the main site.
							Growls.success(
								gettextCatalog.getString( 'auth.authorize.success_growl' ),
								gettextCatalog.getString( 'auth.authorize.success_growl_title' )
							);

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
