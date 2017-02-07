angular.module( 'App.Score.List' ).directive( 'gjScoreList', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./list.html' ),
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
