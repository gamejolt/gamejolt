angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.media.add.video', {
		url: '/video',
		controller: 'Dashboard.Developer.Games.Manage.Media.Add.VideoCtrl',
		controllerAs: 'videoCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/media/add/video/video.html',
	} );
} );
