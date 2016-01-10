angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.scoreboards.scores.list', {
		url: '/scores',
		controller: 'Dashboard.Developer.Games.Manage.Api.Scoreboards.Scores.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/scoreboards/scores/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/api/scores/list-table-scores/' + $stateParams.id + '/' + $stateParams.table );
			}
		}
	} );
} );
