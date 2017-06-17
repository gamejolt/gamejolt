angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('discover.games.view.trophies.list', {
		url: '/trophies',
		controller: 'Discover.Games.View.Trophies.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: require('./list.html'),
		resolve: {
			payload: function(Api, $stateParams) {
				return Api.sendRequest(
					'/web/discover/games/trophies/' + $stateParams.id,
				);
			},
		},
	});
});
