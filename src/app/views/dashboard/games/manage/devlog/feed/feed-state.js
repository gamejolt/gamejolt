angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.devlog.feed', {
		url: '/:tab',
		controller: 'Dashboard.Developer.Games.Manage.Devlog.FeedCtrl',
		controllerAs: 'feedCtrl',
		templateUrl: require('./feed.html'),
		params: {
			tab: {
				value: 'active',
				squash: true,
			},
		},
		resolve: {
			payload: function(Api, $stateParams) {
				return Api.sendRequest(
					'/web/dash/developer/games/devlog/posts/' +
						$stateParams['id'] +
						'/' +
						$stateParams['tab']
				);
			},
		},
	});
});
