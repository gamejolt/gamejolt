angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/games/{slug:string}/comments/{id:int}', '/games/:slug/:id/comments' );
	$stateProvider.state( 'discover.games.view.comments.list', {
		url: '/comments',
		controller: 'Discover.Games.View.Comments.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/games/view/comments/list/list.html'
	} );
} );
