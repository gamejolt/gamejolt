angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.media.image', {
		url: '/image/:imageId',
		controller: 'Dashboard.Developer.Games.Manage.Media.ImageCtrl',
		controllerAs: 'imageCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/media/image/image.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/media/image/' + $stateParams.id + '/' + $stateParams.imageId );
			}
		}
	} );
} );
