angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view.comments', {
		url: '/comments?comment_page',
		controller: 'Discover.Games.View.CommentsCtrl',
		controllerAs: 'commentsCtrl',
		templateUrl: require( './comments.html' )
	} );
} );
