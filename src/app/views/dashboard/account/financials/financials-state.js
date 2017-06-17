angular.module('App.Views').config(function($stateProvider) {
	$stateProvider.state('dash.account.financials', {
		url: '/financials',
		controller: 'Dashboard.Account.FinancialsCtrl',
		controllerAs: 'financialsCtrl',
		templateUrl: require('./financials.html'),
		resolve: {
			payload: function(Api) {
				return Api.sendRequest('/web/dash/financials');
			},
		},
	});
});
