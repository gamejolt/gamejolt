angular
	.module('App.Views.Dashboard')
	.directive('gjDashScoreUserOptionsDeveloper', function() {
		return {
			restrict: 'E',
			template: require('!html-loader!./user-options.html'),
			scope: {},
			bindToController: {
				scoreTable: '=gjScoreTable',
				score: '=gjScore',
			},
			controllerAs: 'ctrl',
			controller: angular.noop,
		};
	});
