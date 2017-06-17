angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.api.scoreboards.list', {
		url: '/scoreboards',
		controller: 'Dashboard.Developer.Games.Manage.Api.Scoreboards.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: require('./list.html'),
		resolve: {
			payload: function(Api, $stateParams) {
				return Api.sendRequest(
					'/web/dash/developer/games/api/scores/' + $stateParams.id,
				);
			},
		},
	});
});
