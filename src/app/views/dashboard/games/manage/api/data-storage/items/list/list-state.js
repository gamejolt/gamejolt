angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.api.data-storage.items.list', {
		url: '/items',
		controller:
			'Dashboard.Developer.Games.Manage.Api.DataStorage.Items.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: require('./list.html'),
		resolve: {
			payload: function(Api, $stateParams) {
				return Api.sendRequest(
					'/web/dash/developer/games/api/data-storage/' + $stateParams.id
				);
			},
		},
	});
});
