angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('discover.games.view.scores', {
		abstract: true,
		template: '<ui-view></ui-view>',
	});
});
