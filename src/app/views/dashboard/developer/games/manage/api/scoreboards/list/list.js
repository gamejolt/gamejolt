angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.scoreboards.list', {
		url: '/scoreboards',
		controller: 'Dashboard.Developer.Games.Manage.Api.Scoreboards.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/scoreboards/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/api/scores/' + $stateParams.id );
			}
		}
	} );
} );
