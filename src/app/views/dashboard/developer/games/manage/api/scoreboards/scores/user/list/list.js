angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.scoreboards.scores.user.list', {
		url: '/user/{user:int}',
		controller: 'Dashboard.Developer.Games.Manage.Api.Scoreboards.Scores.User.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/scoreboards/scores/user/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/api/scores/list-table-user-scores/' + $stateParams.id + '/' + $stateParams.table + '/' + $stateParams.user );
			}
		}
	} );
} );
