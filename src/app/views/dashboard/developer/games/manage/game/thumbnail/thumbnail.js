angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game.thumbnail', {
		url: '/thumbnail',
		controller: 'Dashboard.Developer.Games.Manage.Game.ThumbnailCtrl',
		controllerAs: 'thumbnailCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/thumbnail/thumbnail.html',
	} );
} );
