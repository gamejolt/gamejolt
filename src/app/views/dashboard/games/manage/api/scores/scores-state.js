angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.api.scores', {
		abstract: true,
		url: '/scores',
		template: '<ui-view />',
	});
});
