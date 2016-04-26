angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/games/{slug:string}/devlog/{id:int}', '/games/:slug/:id/devlog' );
	$stateProvider.state( 'discover.games.view.devlog.list', {
		url: '/devlog',
		controller: 'Discover.Games.View.Devlog.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/games/view/devlog/list/list.html'
	} );
} );
