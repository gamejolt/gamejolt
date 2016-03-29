angular.module( 'App.Views' ).controller( 'Dashboard.Main.PurchasesCtrl', function( App, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'Order History' );

	this.orders = payload.orders || [];
} );
