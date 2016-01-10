angular.module( 'App.Views' ).directive( 'gjDashListScoresDeveloper', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/scoreboards/_list-scores/list-scores.html',
		scope: {},
		bindToController: {
			scoreTable: '=gjScoreTable',
			scores: '=gjScores',
			isForUser: '=?isForUser',
			onRemove: '&?',
		},
		controllerAs: 'ctrl',
		controller: function( $scope, $state, ModalConfirm )
		{
			var _this = this;

			$scope.$state = $state;

			this.removeScore = function( score )
			{
				ModalConfirm.show( 'Are you sure you want to remove this score?' )
					.then( function()
					{
						return score.$remove();
					} )
					.then( function()
					{
						if ( _this.onRemove ) {
							_this.onRemove( { $score: score } );
						}
					} );
			};
		}
	};
} );
