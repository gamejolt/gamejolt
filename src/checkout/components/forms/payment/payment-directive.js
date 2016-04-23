angular.module( 'App.Forms' ).directive( 'gjFormPayment', function( $q, $window, App, Api, Form, Geo, Environment )
{
	var form = new Form( {
		template: '/checkout/components/forms/payment/payment.html'
	} );

	form.scope.cards = '=';
	form.scope.order = '=';

	form.onInit = function( scope )
	{
		scope.App = App;

		scope.formState.stripeError = null;
		scope.formState.countries = Geo.getCountries();

		scope.formModel.country = 'us';
		scope.formModel.selectedCard = 0;
		if ( scope.cards && scope.cards.length ) {
			scope.formModel.selectFormedCard = scope.cards[0].id;
		}

		scope.formModel.save_card = true;

		if ( Environment.env == 'development' ) {
			scope.formModel.fullname = 'Vash the Stampede';
			scope.formModel.card_number = '4242424242424242';
			scope.formModel.exp = '12/16';
			scope.formModel.cvc = '123';
			scope.formModel.street1 = "No-man's Land";
			scope.formModel.postcode = '11111';
			scope.formModel.save_card = false;
		}

		scope.$watch( 'formModel.country', function( country )
		{
			scope.formState.regions = Geo.getRegions( country );
			if ( scope.formState.regions ) {
				scope.formModel.region = scope.formState.regions[0].code;  // Default to first.
			}
			else {
				scope.formModel.region = '';
			}
		} );
	};

	form.onSubmit = function( scope )
	{
		// New card
		if ( scope.formModel.selectedCard == 0 ) {

			var exp = scope.formModel.exp.split( '/' );
			var formData = {
				number: scope.formModel.card_number,
				exp_month: exp[0],
				exp_year: exp[1],
				cvc: scope.formModel.cvc,

				name: scope.formModel.fullname,
				address_country: scope.formModel.country,
				address_line1: scope.formModel.street1,
				address_state: scope.formModel.region,
				address_zip: scope.formModel.postcode,
			};

			return $q( function( resolve, reject )
			{
				$window.Stripe.card.createToken( formData, function( status, response )
				{
					if ( response.error ) {
						scope.formState.stripeError = response.error;
						reject( response );
					}
					else {
						resolve( response );
					}
				} );
			} )
			.then( function( response )
			{
				var data = {
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

			var data = { payment_source: scope.formModel.selectedCard };
			return Api.sendRequest( '/web/checkout/charge/' + scope.order.id, data );
		}
	};

	return form;
} );
