export function FinancialsFormFactory(
	Form: any,
	currencyFilter: ng.IFilterCurrency,
	Api: any,
	Growls: any,
)
{
	const form = new Form( {
		template: '/app/components/forms/dashboard/financials/financials.html',
	} );

	form.onInit = ( scope: any ) =>
	{
		scope.currencyFilter = currencyFilter;
		scope.formState.isLoaded = false;

		// We will set this to which agreement we should show them depending on
		// their account type.
		scope.formState.whichAgreement = null;

		Api.sendRequest( '/web/dash/financials/save' )
			.then( ( payload: any ) =>
			{
				scope.account = payload.account;
				scope.user = payload.user;
				scope.partner = payload.partner;

				scope.maxWallet = payload.maxWallet;
				scope.maxPayout = payload.maxPayout;
				scope.minWithdraw = payload.minWithdraw;

				scope.formModel.wallet_maximum = scope.user.revenue_wallet_maximum / 100;
				scope.formModel.payout_minimum = scope.user.revenue_payout_minimum / 100;
				scope.formModel.percentage_split = 100 - scope.user.revenue_percentage;

				scope.formState.isLoaded = true;

				if ( scope.account ) {
					if ( scope.account.tos_signed_developer ) {
						scope.formState.whichAgreement = 'developer';
					}
					else if ( scope.account.tos_signed_partner ) {
						scope.formState.whichAgreement = 'partner';
					}
				}

				// We don't show them the partner agreement if they can't be a partner.
				if ( !scope.partner && !scope.formState.whichAgreement ) {
					scope.formState.whichAgreement = 'developer';
				}
			} );

		scope.sliderOptions = {
			floor: 0,
			ceil: 100,
			translate: ( v: number ) =>
			{
				return v + '%';
			},
			onEnd: () =>
			{
				if ( scope.formModel.percentage_split > 10 ) {
					scope.formModel.percentage_split = 10;
				}
			}
		};

		scope.hasSignedAgreement = () =>
		{
			if ( !scope.account ) {
				return false;
			}

			return scope.account.tos_signed_developer || scope.account.tos_signed_partner;
		};

		scope.acceptTerms = ( type: 'developer' | 'partner' ) =>
		{
			return Api.sendRequest( '/web/dash/financials/save', { tos_type: type } )
				.then( ( response: any ) =>
				{
					if ( response.success !== false ) {
						scope.account = response.account;
						scope.user = response.user;
					}
				} )
				.catch( () =>
				{
					Growls.error( 'Something went wrong.' );
				} );
		}
	};

	form.onSubmit = ( scope: any ) =>
	{
		return Api.sendRequest( '/web/dash/financials/save', scope.formModel )
			.then( ( response: any ) =>
			{
				if ( response.success !== false ) {
					scope.account = response.account;
					scope.user = response.user;
				}

				return response;
			} )
			.catch( () =>
			{
				Growls.error( 'Something went wrong.' );
			} );
	};

	return form;
}
