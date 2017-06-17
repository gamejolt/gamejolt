angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.game.packages.edit.widget', {
		url: '/widget',
		controller:
			'Dashboard.Developer.Games.Manage.Game.Packages.Edit.WidgetCtrl',
		controllerAs: 'widgetCtrl',
		templateUrl: require('./widget.html'),
		resolve: {
			widgetPayload: function($stateParams, Api) {
				return Api.sendRequest(
					'/web/dash/developer/games/packages/preview/' +
						$stateParams.id +
						'/' +
						$stateParams.packageId,
				);
			},
		},
	});
});
