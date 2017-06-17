angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.api.scores.view', {
		url: '/{score:int}',
		controller: 'Dashboard.Developer.Games.Manage.Api.Scores.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: require('./view.html'),
		resolve: {
			payload: function(Api, $stateParams) {
				return Api.sendRequest(
					'/web/dash/developer/games/api/scores/' +
						$stateParams.id +
						'/' +
						$stateParams.score
				);
			},
		},
	});
});
