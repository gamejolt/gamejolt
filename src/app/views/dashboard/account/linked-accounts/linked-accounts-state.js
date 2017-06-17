angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.account.linked-accounts', {
		url: '/linked-accounts',
		controller: 'Dashboard.Account.LinkedAccountsCtrl',
		controllerAs: 'linkedAccountsCtrl',
		templateUrl: require('./linked-accounts.html'),
		resolve: {
			payload: function(Api) {
				return Api.sendRequest('/web/dash/linked-accounts');
			},
		},
	});
});
