angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.key-groups', {
		abstract: true,
		url: '/keys',
		templateUrl: require('./key-groups.html'),
	});
});
