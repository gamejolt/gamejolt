angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.landing.active', {
		url: '/forums/active',
		controller: 'Forums.Landing.ActiveCtrl',
		controllerAs: 'activeCtrl',
		templateUrl: require( './active.html' ),
		resolve: {
			payload: function( Api, History_Cache )
			{
				return History_Cache.cache( function()
				{
					return Api.sendRequest( '/web/forums/active-topics' );
				} );
			},
		},
	} );
} );
