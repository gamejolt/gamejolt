export function PaymentComponent( $q, $window, App, Api, Form, Geo, Environment )
{
	const form = new Form( {
		template: '/checkout/components/forms/payment/payment.html'
	} );

	form.scope.cards = '=';
	form.scope.order = '=';

	form.onInit = function( scope )
	{
		scope.App = App;

		scope.formState.stripeError = null;
		scope.formState.countries = Geo.getCountries();
		scope.formState.calculatedTax = false;
		scope.formState.taxAmount = 0;

		scope.formModel.country = 'us';
		scope.formModel.selectedCard = 0;
		if ( scope.cards && scope.cards.length ) {
			scope.formModel.selectedCard = scope.cards[0].id;
		}

		scope.formModel.save_card = true;

		if ( Environment.env == 'development' ) {
			scope.formModel.fullname = 'Vash the Stampede';
			scope.formModel.card_number = '4242424242424242';
			scope.formModel.exp = '1216';
			scope.formModel.cvc = '123';
			scope.formModel.street1 = "No-man's Land";
			scope.formModel.postcode = '11111';
			scope.formModel.save_card = false;
		}

		scope.$watch( 'formModel.country', ( country ) =>
		{
			scope.formState.regions = Geo.getRegions( country );
			if ( scope.formState.regions ) {
				scope.formModel.region = scope.formState.regions[0].code;  // Default to first.
			}
			else {
				scope.formModel.region = '';
			}
		} );

		scope.$watchGroup( [ 'formModel.country', 'formModel.region' ], getTax );

		function getTax()
		{
			scope.formState.calculatedTax = false;
			if ( !scope.formModel.country || !scope.formModel.region ) {
				return;
			}

			const data = {
				amount: scope.order.amount,
				country: scope.formModel.country,
				region: scope.formModel.region,
			};

			return Api.sendRequest( '/web/checkout/taxes', data, { detach: true } )
				.then( ( response ) =>
				{
					scope.formState.calculatedTax = true;
					scope.formState.taxAmount = response.amount;
				} );
		}
	};

	form.onSubmit = function( scope )
	{
		scope.formState.stripeError = null;

		// New card
		if ( scope.formModel.selectedCard == 0 ) {

			const formData = {
				number: scope.formModel.card_number,
				exp_month: scope.formModel.exp.substr( 0, 2 ),
				exp_year: scope.formModel.exp.substr( 2, 2 ),
				cvc: scope.formModel.cvc,

				name: scope.formModel.fullname,
				address_country: scope.formModel.country,
				address_line1: scope.formModel.street1,
				address_state: scope.formModel.region,
				address_zip: scope.formModel.postcode,
			};

			return $q( ( resolve, reject ) =>
			{
				$window.Stripe.card.createToken( formData, ( status, response ) =>
				{
					if ( response.error ) {
						scope.formState.stripeError = response.error.message;
						reject( response );
					}
					else {
						resolve( response );
					}
				} );
			} )
			.then( ( response ) =>
			{
				const data = {
					save_card: false,
					token: response.id,
					amount: (scope.order.amount / 100),

					fullname: scope.formModel.fullname,
					country: scope.formModel.country,
					region: scope.formModel.region,
					street1: scope.formModel.street1,
					postcode: scope.formModel.postcode,
				}

				if ( App.user ) {
					data.save_card = scope.formModel.save_card;
				}

				return Api.sendRequest( '/web/checkout/charge/' + scope.order.id, data );
			} );

		}
		// Existing/saved card
		else {

			const data = { payment_source: scope.formModel.selectedCard };
			return Api.sendRequest( '/web/checkout/charge/' + scope.order.id, data );
		}
	};

	return form;
}
