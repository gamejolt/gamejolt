angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Main.Purchases.ListCtrl', function( App, Order, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'Order History' );

	this.orders = Order.populate( payload.orders );
} );
