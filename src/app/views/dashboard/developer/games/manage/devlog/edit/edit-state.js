angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.devlog.edit', {
		url: '/edit/:postId',
		controller: 'Dashboard.Developer.Games.Manage.Devlog.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/devlog/edit/edit.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/devlog/' + $stateParams.id + '/' + $stateParams.postId );
			}
		}
	} );
} );
