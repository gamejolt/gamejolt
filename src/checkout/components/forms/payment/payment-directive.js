angular.module( 'App.Forms' ).directive( 'gjFormPayment', function( $q, $window, App, Api, Form )
{
	var form = new Form( {
		template: '/checkout/components/forms/payment/payment.html'
	} );

	form.scope.cards = '=';
	form.scope.order = '=';

	form.onInit = function( scope )
	{
		scope.formState.stripeError = null;

		scope.formModel.selectedCard = 0;
		if ( scope.cards && scope.cards.length ) {
			scope.formModel.selectedCard = scope.cards[0].id;
		}

		// scope.formModel.card_number = '4242424242424242';
		// scope.formModel.exp = '12/16';
		// scope.formModel.cvc = '123';
		scope.formModel.save_card = true;

		console.log( scope.cards );
	};

	form.onSubmit = function( scope )
	{
		console.log( 'try' );
		var exp = scope.formModel.exp.split( '/' );
		var formData = {
			number: scope.formModel.card_number,
			exp_month: exp[0],
			exp_year: exp[1],
			cvc: scope.formModel.cvc,
		};

		return $q( function( resolve, reject )
		{
			$window.Stripe.card.createToken( formData, function( status, response )
			{
				console.log( 'response' );
				console.log( status, response );

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
			console.log( response.id, scope.order );
			var data = {
				token: response.id,
				amount: (scope.order.amount / 100),
			}
			if ( App.user ) {
				data.save_card = scope.formModel.save_card;
			}

			return Api.sendRequest( '/web/checkout/charge/' + scope.order.id, data );
		} );
	};

	return form;
} );
