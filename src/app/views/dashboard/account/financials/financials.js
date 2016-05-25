angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.account.financials', {
		url: '/financials',
		controller: 'Dashboard.Account.FinancialsCtrl',
		controllerAs: 'financialsCtrl',
		templateUrl: '/app/views/dashboard/account/financials/financials.html',
		data: {
			secure: true,
		},
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/financials' );
			}
		}
	} );
} );
