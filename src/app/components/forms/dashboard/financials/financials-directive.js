angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancials', function( $q, $ocLazyLoad, $window, Form, Api, Growls, Environment, currencyFilter )
{
	var form = new Form( {
		template: '/app/components/forms/dashboard/financials/financials.html',
	} );

	form.onInit = function( scope )
	{
		scope.currencyFilter = currencyFilter;
		scope.formState.isLoaded = false;

		Api.sendRequest( '/web/dash/financials/save' )
			.then( function( payload )
			{
				scope.account = payload.account;
				scope.user = payload.user;

				scope.maxWallet = payload.maxWallet;
				scope.maxPayout = payload.maxPayout;
				scope.minWithdraw = payload.minWithdraw;

				scope.formModel.wallet_maximum = scope.user.revenue_wallet_maximum / 100;
				scope.formModel.payout_minimum = scope.user.revenue_payout_minimum / 100;
				scope.formModel.percentage_split = 100 - scope.user.revenue_percentage;

				scope.formState.isLoaded = true;
			} );

		scope.sliderOptions = {
			floor: 0,
			ceil: 100,
			translate: function( v )
			{
				return v + '%';
			},
			onEnd: function()
			{
				if ( scope.formModel.percentage_split > 10 ) {
					scope.formModel.percentage_split = 10;
				}
            }
		};

		scope.linkPayPal = function()
		{
			Api.sendRequest( '/web/dash/financials/get-paypal-auth', null, { detach: true } )
				.then( function( response )
				{
					if ( !response || !response.authUrl ) {
						return $q.reject();
					}

					if ( Environment.isClient ) {
						require( 'nw.gui' ).Shell.openExternal( response.authUrl );
					}
					else {
						$window.location = response.authUrl;
					}
				} )
				.catch( function( e )
				{
					Growls.error( 'Could not get PayPal redirect URL.' );
				} );
		};
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/financials/save', scope.formModel )
			.then( function( response )
			{
				if ( response.success !== false ) {
					scope.account = response.account;
					scope.user = response.user;
				}

				return response;
			} )
			.catch( function( e )
			{
				Growls.error( 'Something went wrong.' );
			} );
	};

	return form;
} );
