angular.module( 'App.Score.List' ).directive( 'gjScoreList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/score/list/list.html',
		scope: {
			scores: '=scoreListScores',
			startRank: '=?scoreListStartRank',
			step: '=?scoreListStep',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop
	};
} );
