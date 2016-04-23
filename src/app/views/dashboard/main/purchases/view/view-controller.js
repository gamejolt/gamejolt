angular.module( 'App.Views' ).controller( 'Dashboard.Main.Purchases.ViewCtrl', function( $scope, App, Order, Order_Payment, Game, Game_Package, Geo, dateFilter, gettextCatalog, payload )
{
	$scope.Geo = Geo;
	$scope.Order_Payment = Order_Payment;
	$scope.dateFilter = dateFilter;

	this.order = new Order( payload.order );
	this.packagesBySellable = _.groupBy( Game_Package.populate( payload.packages ), 'sellable_id' );
	this.games = _.indexBy( Game.populate( payload.games ), 'id' );

	this.firstRefund = null;
	if ( this.order._is_refunded && this.order.payments[0] && this.order.payments[0].refunds ) {
		this.firstRefund = this.order.payments[0].refunds[0];
	}

	App.title = gettextCatalog.getString( 'View Order: #{{ orderId }}', { orderId: this.order.id } );
} );
