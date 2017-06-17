angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('discover.games.view.scores.list', {
		url: '/scores/{tableId:int}/{type:path}?page',
		controller: 'Discover.Games.View.Scores.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: require('./list.html'),
		resolve: {
			payload: function(Api, $stateParams) {
				var query = '';
				if ($stateParams.page > 1) {
					query = '?page=' + $stateParams.page;
				}

				var url =
					'/web/discover/games/scores/' +
					$stateParams.id +
					'/' +
					$stateParams.tableId +
					'/' +
					$stateParams.type;
				return Api.sendRequest(url + query);
			},
		},
	});
});
