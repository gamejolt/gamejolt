angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.game.packages', {
		abstract: true,
		url: '/packages',
		template: '<ui-view></ui-view>',
	});
});
