angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/community/forums/:slug/2', '/f/gj-feedback' );
	$urlRouterProvider.when( '/community/forums/:slug/7', '/f/jams' );
	$urlRouterProvider.when( '/community/forums/:slug/1', '/f/casual' );
	$urlRouterProvider.when( '/community/forums/:slug/3', '/f/casual' );
	$urlRouterProvider.when( '/community/forums/:slug/4', '/f/coding' );
	$urlRouterProvider.when( '/community/forums/:slug/5', '/f/art' );
	$urlRouterProvider.when( '/community/forums/:slug/9', '/f/gj-game-api' );

	$stateProvider.state( 'forums.channels.view.page', {
		url: '/f/:name?page',
		controller: 'Forums.Channels.View.PageCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/forums/channels/' + $stateParams.name + '?page=' + ($stateParams.page || 1) );
			}
		}
	} );
} );
