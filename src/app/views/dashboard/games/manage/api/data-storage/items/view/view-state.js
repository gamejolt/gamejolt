angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.api.data-storage.items.view', {
		url: '/items/{item:int}',
		controller:
			'Dashboard.Developer.Games.Manage.Api.DataStorage.Items.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: require('./view.html'),
		resolve: {
			payload: function(Api, $stateParams) {
				return Api.sendRequest(
					'/web/dash/developer/games/api/data-storage/' +
						$stateParams.id +
						'/' +
						$stateParams.item
				);
			},
		},
	});
});
