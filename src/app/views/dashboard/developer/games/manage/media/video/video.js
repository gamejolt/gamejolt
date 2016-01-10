angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.media.video', {
		url: '/video/:videoId',
		controller: 'Dashboard.Developer.Games.Manage.Media.VideoCtrl',
		controllerAs: 'videoCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/media/video/video.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/media/video/' + $stateParams.id + '/' + $stateParams.videoId );
			}
		}
	} );
} );
