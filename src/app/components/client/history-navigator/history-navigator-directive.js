angular
	.module('App.Client.HistoryNavigator')
	.directive('gjClientHistoryNavigator', function(HistoryNavigator) {
		return {
			restrict: 'E',
			scope: {},
			template: require('!html-loader!./history-navigator.html'),
			link: function(scope) {
				scope.HistoryNavigator = HistoryNavigator;
			},
		};
	});
