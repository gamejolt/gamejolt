angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.account.linked-accounts', {
		url: '/linked-accounts',
		controller: 'Dashboard.Account.LinkedAccountsCtrl',
		controllerAs: 'linkedAccountsCtrl',
		templateUrl: '/app/views/dashboard/account/linked-accounts/linked-accounts.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/linked-accounts' );
			}
		}
	} );
} );
