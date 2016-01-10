angular.module( 'App.Views' ).controller( 'Dashboard.WithdrawFundsCtrl', function( $state, Growls, Translate, payload )
{
	Translate.pageTitle( 'dash.funds.withdraw.page_title' );

	this.minAmount = payload.minAmount || 0;
	this.revenueTotal = payload.revenueTotal || 0;
	this.revenueWithdrawn = payload.revenueWithdrawn || 0;
	this.revenueCurrent = payload.revenueCurrent || 0;
	this.revenuePending = payload.revenuePending || 0;
	this.revenueWithdrawable = payload.revenueWithdrawable || 0;

	this.email = payload.email || '';

	this.onSubmit = function( response )
	{
		Translate.growl( 'success', 'dash.funds.withdraw.success' );
		$state.go( '^.overview' );
	};
} );
