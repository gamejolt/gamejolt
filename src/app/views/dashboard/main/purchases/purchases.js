angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.purchases', {
		url: '/purchases',
		controller: 'Dashboard.Main.PurchasesCtrl',
		controllerAs: 'purchasesCtrl',
		templateUrl: '/app/views/dashboard/main/purchases/purchases.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/purchases' );
			}
		}
	} );
} );
