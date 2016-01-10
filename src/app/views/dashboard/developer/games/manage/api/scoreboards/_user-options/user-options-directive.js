angular.module( 'App.Views' ).directive( 'gjDashScoreUserOptionsDeveloper', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/scoreboards/_user-options/user-options.html',
		scope: {},
		bindToController: {
			scoreTable: '=gjScoreTable',
			score: '=gjScore',
		},
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
