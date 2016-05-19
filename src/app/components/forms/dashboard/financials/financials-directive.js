angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancials', function( $q, $window, Form, Api, Growls, Environment, currencyFilter )
{
	var form = new Form( {
		template: '/app/components/forms/dashboard/financials/financials.html',
		reloadOnSubmit: true,
	} );

	form.onInit = function( scope )
	{
		scope.stripeMeta = null;
		scope.additionalOwnerIndex = 0;

		scope.currencyFilter = currencyFilter;
		scope.formState.isLoaded = false;
		scope.formState.currencies = [];

		if ( Environment.env == 'development' ) {
			scope.formModel.bankAccount_country = 'GB';
			scope.formModel.bankAccount_currency = 'GBP',
			scope.formModel.bankAccount_accountNumber = '00012345';
			scope.formModel.bankAccount_routingNumber = '108800';
			scope.formModel.bankAccount_accountHolderName = 'MR I C ROFLCOPTER';
			scope.formModel.bankAccount_accountHolderType = 'individual';
		}

		//scope.formModel.type = 'individual';

		Api.sendRequest( '/web/dash/financials/save' )
			.then( function( payload )
			{
				//scope.account = payload.account;
				//scope.user = payload.user;

				//scope.maxWallet = payload.maxWallet;
				//scope.maxPayout = payload.maxPayout;
				//scope.minWithdraw = payload.minWithdraw;

				Stripe.setPublishableKey( payload.stripe.publishableKey );

				angular.extend( scope, payload );

				scope.formModel.wallet_maximum = scope.user.revenue_wallet_maximum / 100;
				scope.formModel.payout_minimum = scope.user.revenue_payout_minimum / 100;
				scope.formModel.percentage_split = 100 - scope.user.revenue_percentage;

				scope.stripeMeta = {};
				angular.extend( scope.stripeMeta, payload.stripe.required );

				var flatObj = {};
 				dotflatten( flatObj, payload.stripe.current );
 				console.log( flatObj );
 				angular.extend( scope.formModel, flatObj );

 				if ( payload.stripe.current.legal_entity.additional_owners ) {
					scope.formModel['legal_entity.additional_owners'] = {};
					angular.extend( scope.formModel['legal_entity.additional_owners'], payload.stripe.current.legal_entity.additional_owners );

					scope.additionalOwnerIndex = payload.stripe.current.legal_entity.additional_owners.length;

					for (var i = 0; i < scope.additionalOwnerIndex; i++) {
						delete scope.formModel['legal_entity.additional_owners'][i].verification.details;
						delete scope.formModel['legal_entity.additional_owners'][i].verification.details_code;
						delete scope.formModel['legal_entity.additional_owners'][i].verification.document;
						delete scope.formModel['legal_entity.additional_owners'][i].verification.status;
						delete scope.formModel['legal_entity.additional_owners'][i].verification;
					}
				}

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

		function dotflatten(res, obj, current) {
			for ( var key in obj ) {
				var value = obj[ key ];
				var newKey = (current ? current + "." + key : key );  // joined key with dot
				if ( (
						newKey.substr(0,'legal_entity'.length) != 'legal_entity' &&
					 	newKey.substr(0,'business_'.length) != 'business_'
					 ) || (
					 	newKey == 'legal_entity.verification' || newKey == 'legal_entity.business_tax_id_provided' || newKey == 'legal_entity.additional_owners'
					 ) ) {

				}
				else if (newKey == 'legal_entity.additional_owners') {

				}
				else if ( value && typeof value == "array" ) {
					res[ newKey ] = value;  // it's not an object, so set the property
				}
				else if ( value && typeof value == "object" ) {
					dotflatten( res, value, newKey );  // it's a nested object, so do it again
				}
				else {
					res[ newKey ] = value;  // it's not an object, so set the property
				}
			}
		}

		scope.hasField = function( field )
		{
			if ( !scope.stripeMeta ) {
				return undefined;
			}
			return scope.stripeMeta.minimum.indexOf( field ) != -1 || scope.stripeMeta.additional.indexOf( field ) != -1;
		};

		/*scope.onStripeNext = function()
		{
			console.log('next');
		}
*/
		// use watchers to tell when the select/checkbox value is changed?
		scope.canStripeNext = function()
		{
			if ( scope.account && !scope.account.type && !scope.account.country_code ) {
				return true;
			}
			else if ( scope.account && scope.account.type && scope.account.country_code && !scope.account.is_verified ) {
				return true;
			}
			return false;
			// & scope.formModel.type
		}

		scope.addAdditionalOwner = function()
		{
			console.log('add additional owner');
			if ( scope.formModel['legal_entity.additional_owners'] == null ) {
				scope.formModel['legal_entity.additional_owners'] = [];
			}

			scope.formModel['legal_entity.additional_owners'][""+scope.additionalOwnerIndex] = {};
			console.log( scope.formModel['legal_entity.additional_owners'] );

			angular.merge( scope.formModel['legal_entity.additional_owners'][scope.additionalOwnerIndex], {
				first_name: null,
				last_name: null,
				address: {
					city: null,
					line1: null,
					postal_code: null,
				},
				dob: {
					day: null,
					month: null,
					year: null,
				}
			} );

			console.log( scope.formModel );

			scope.additionalOwnerIndex++;
		}

		scope.removeAdditionalOwner = function(index)
		{
			console.log('remove owner ' + index);

			delete scope.formModel['legal_entity.additional_owners'][""+index];

			// reindex the others...
			var newOwners = {};
			var c = 0;
			for( var key in scope.formModel['legal_entity.additional_owners'] ) {
				newOwners[""+c] = scope.formModel['legal_entity.additional_owners'][key];
				c++;
			}
			delete scope.formModel['legal_entity.additional_owners'];
			scope.formModel['legal_entity.additional_owners'] = newOwners;

			if ( scope.formModel['legal_entity.additional_owners'].length == 0 ) {
				scope.formModel['legal_entity.additional_owners'] = null;
			}

			console.log( scope.formModel );

			scope.additionalOwnerIndex--;
		}

		scope.updateCurrencies = function( )
		{
			scope.formState.currencies = scope.stripe.currencies[ scope.formModel.bankAccount_country ];
		}

		scope.finishRequest = function() {
			// We don't want to send the sensitive data to GJ.
			var data = angular.copy( scope.formModel );
			delete data.bankAccount_country;
			delete data.bankAccount_currency;
			delete data.bankAccount_routingNumber;
			delete data.bankAccount_accountNumber;
			delete data.bankAccount_accountHolderName;
			delete data.bankAccount_accountHolderType;

			var options = {
				allowComplexData: [ 'legal_entity.additional_owners' ]
			};

			console.log( 'document' );
			console.log( scope.formModel['legal_entity.verification.document'] );
			console.log( scope.formModel );

			if ( scope.formModel['legal_entity.verification.document'] ) {
				console.log( 'include files' );
				options.file = {
					'legal_entity_verification_document': scope.formModel['legal_entity.verification.document'],
					//file_other: file2
				};
			}

			return Api.sendRequest( '/web/dash/financials/save', data, options )
				.then( function( response )
				{
					if ( response.success !== false ) {
						angular.extend( scope, response );
						Growls.success( 'Saved!' );
					}

					// Scroll to top if we just got verified? Dunno. Don't want to scroll up every time.
					//if ( response.account.is_verified ) {
					//	$window.scrollTo(0, 0);
					//}


					return response;
				} )
				.catch( function( e )
				{
					Growls.error( 'Something went wrong.' );
				} );
		}

	};

	form.onSubmit = function( scope )
	{
		console.log('on submit');

		// bankAccount.validateRoutingNumber
		// bankAccount.validateAccountNumber



		// Submit straight away.
		if ( scope.stripe.current.external_accounts.total_count >= 1 ) {
			return scope.finishRequest();
		}
		else {
			// Create a Stripe bank account and then finish the request.
			Stripe.bankAccount.createToken( {
				country: 				scope.formModel.bankAccount_country,
				currency: 				scope.formModel.bankAccount_currency,
				routing_number: 		scope.formModel.bankAccount_routingNumber,
				account_number: 		scope.formModel.bankAccount_accountNumber,
				account_holder_name: 	scope.formModel.bankAccount_accountHolderName,
				account_holder_type: 	scope.formModel.bankAccount_accountHolderType
			}, function(status, response) {
				if (response.error) {
					Growls.error( 'Something went wrong: ' + response.error.message );
				} else {
					var token = response.id;
					scope.formModel.external_account = token;
				}
				scope.finishRequest();
			} )
		}




	};

	return form;
} );
