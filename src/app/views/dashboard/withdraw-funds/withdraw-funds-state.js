angular
	.module('App.Views')
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.when(
			'/dashboard/developer/withdraw-funds',
			'/dashboard/withdraw-funds',
		);

		$stateProvider.state('dash.withdraw-funds', {
			url: '/withdraw-funds',
			controller: 'Dashboard.WithdrawFundsCtrl',
			controllerAs: 'withdrawCtrl',
			templateUrl: require('./withdraw-funds.html'),
			resolve: {
				payload: function(Api) {
					return Api.sendRequest('/web/dash/funds');
				},
			},
		});
	});
