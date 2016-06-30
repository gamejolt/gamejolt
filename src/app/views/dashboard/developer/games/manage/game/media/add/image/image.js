angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.media.add.image', {
		url: '/image',
		controller: 'Dashboard.Developer.Games.Manage.Media.Add.ImageCtrl',
		controllerAs: 'imageCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/media/add/image/image.html',
	} );
} );
