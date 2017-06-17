angular
	.module('App.Views.Dashboard')
	.directive('gjDashListScoresDeveloper', function() {
		return {
			restrict: 'E',
			template: require('!html-loader!./list-scores.html'),
			scope: {},
			bindToController: {
				scoreTable: '=gjScoreTable',
				scores: '=gjScores',
				isForUser: '=?isForUser',
				onRemove: '&?',
			},
			controllerAs: 'ctrl',
			controller: function($scope, $state, ModalConfirm) {
				var _this = this;

				$scope.$state = $state;

				this.removeScore = function(score) {
					ModalConfirm.show('Are you sure you want to remove this score?')
						.then(function() {
							return score.$remove();
						})
						.then(function() {
							if (_this.onRemove) {
								_this.onRemove({ $score: score });
							}
						});
				};
			},
		};
	});
