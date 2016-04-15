angular.module( 'App.Views' ).controller( 'Dashboard.Main.Purchases.ViewCtrl', function( $scope, App, Order, Order_Payment, Game, Game_Package, gettextCatalog, payload )
{
	$scope.Order_Payment = Order_Payment;

	this.order = new Order( payload.order );
	this.packagesBySellable = _.groupBy( Game_Package.populate( payload.packages ), 'sellable_id' );
	this.games = _.indexBy( Game.populate( payload.games ), 'id' );

	App.title = gettextCatalog.getString( 'View Order: #{{ orderId }}', { orderId: this.order.id } );
} );
