angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.games.manage.game.packages.release', {
		abstract: true,
		url: '/{packageId:int}/releases/{releaseId:int}',
		controller: 'Dashboard.Developer.Games.Manage.Game.Packages.ReleaseCtrl',
		controllerAs: 'releaseCtrl',
		template: '<ui-view></ui-view>',
		resolve: {
			payload: function($stateParams, Api) {
				return Api.sendRequest(
					'/web/dash/developer/games/releases/' +
						$stateParams.id +
						'/' +
						$stateParams.packageId +
						'/' +
						$stateParams.releaseId
				);
			},
		},
	});
});
