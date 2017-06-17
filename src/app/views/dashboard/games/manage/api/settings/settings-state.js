angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.api.settings', {
		url: '/settings',
		controller: 'Dashboard.Developer.Games.Manage.Api.SettingsCtrl',
		controllerAs: 'settingsCtrl',
		templateUrl: require('./settings.html'),
		resolve: {
			payload: function(Api, $stateParams) {
				return Api.sendRequest(
					'/web/dash/developer/games/api/settings/' + $stateParams.id,
				);
			},
		},
	});
});
