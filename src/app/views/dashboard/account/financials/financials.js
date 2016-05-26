angular.module( 'App.Views' ).config( function( $stateProvider, ProtocolWatcherProvider )
{
	ProtocolWatcherProvider.registerSecure( 'dashboard.account.financials' );

	$stateProvider.state( 'dashboard.account.financials', {
		url: '/financials',
		controller: 'Dashboard.Account.FinancialsCtrl',
		controllerAs: 'financialsCtrl',
		templateUrl: '/app/views/dashboard/account/financials/financials.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/financials' );
			}
		}
	} );
} );
