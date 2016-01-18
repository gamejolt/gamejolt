angular.module( 'App.Views' ).controller( 'Dashboard.WithdrawFundsCtrl', function( $state, Growls, App, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'dash.funds.withdraw.page_title' );

	this.minAmount = payload.minAmount || 0;
	this.revenueTotal = payload.revenueTotal || 0;
	this.revenueWithdrawn = payload.revenueWithdrawn || 0;
	this.revenueCurrent = payload.revenueCurrent || 0;
	this.revenuePending = payload.revenuePending || 0;
	this.revenueWithdrawable = payload.revenueWithdrawable || 0;

	this.email = payload.email || '';

	this.onSubmit = function( response )
	{
		Growls.success(
			gettextCatalog.getString( 'dash.funds.withdraw.success_growl' ),
			gettextCatalog.getString( 'dash.funds.withdraw.success_growl_title' )
		);
		$state.go( '^.overview' );
	};
} );
