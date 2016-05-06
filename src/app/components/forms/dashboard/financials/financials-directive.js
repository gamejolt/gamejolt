angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancials', function( $q, Form, Api )
{
	var form = new Form( {
		template: '/app/components/forms/dashboard/financials/financials.html'
	} );

	form.scope.account = '=';

	form.onInit = function( scope )
	{
		scope.formModel.percentage_split = 10;
		scope.stripeMeta = null;
		scope.isLoaded = false;
		scope.tos_signed = false;
		scope.additionalOwnerIndex = 0;

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

		var promise;
		if ( !scope.account ) {
			scope.formModel.type = 'individual';
			promise = Api.sendRequest( '/web/dash/financials/setup', null, { detach: true } );
		}
		else {
			scope.formModel.type = scope.account.type;
			promise = Api.sendRequest( '/web/dash/financials/save', null, { detach: true } );
		}

		promise.then( function( payload )
		{
			console.log( payload );
			angular.extend( scope, payload );

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
				}
			}


			scope.stripeMeta = {};
			angular.extend( scope.stripeMeta, payload.stripe.required );

			// I think I'm supposed to use angular.extend but I don't want to extend the whole payload to the form.
			scope.formModel.wallet_maximum = payload.wallet_maximum;
			scope.formModel.payout_minimum = payload.payout_minimum;
			scope.formModel.percentage_split = payload.percentage_split;

			scope.isLoaded = true;
		} );

		scope.hasField = function( field )
		{
			if ( !scope.stripeMeta ) {
				return undefined;
			}
			return scope.stripeMeta.minimum.indexOf( field ) != -1 || scope.stripeMeta.additional.indexOf( field ) != -1;
		};

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


		scope.addAdditionalOwner = function() {
			console.log('add additional owner');
			if ( scope.formModel['legal_entity.additional_owners'] == null ) {
				scope.formModel['legal_entity.additional_owners'] = [];
			}

			scope.formModel['legal_entity.additional_owners'][""+scope.additionalOwnerIndex] = {};
			console.log( scope.formModel['legal_entity.additional_owners'] );

			angular.merge( scope.formModel['legal_entity.additional_owners'][""+scope.additionalOwnerIndex], {
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
				}/*,
				/*verification: {
					details: null,
					details_code: null,
					document: null,
					status: 'unverified'
				}*/
			} );

			console.log( scope.formModel );

			scope.additionalOwnerIndex++;
		}

		scope.onSubmitPaypal = function(  )
		{
			console.log( scope.paypal.authUrl );
			window.location = scope.paypal.authUrl;
		}
		scope.onSubmitTOS = function()
		{
			var promise = Api.sendRequest( '/web/dash/financials/agree' );
			return promise.then( function( response )
			{
				if ( response.success !== false ) {
					angular.extend( scope, response );
				}
				return response;
			} );
		}

		scope.onSubmitTemp = function( )
		{
			var promise;
			if ( !scope.account ) {
				promise = Api.sendRequest( '/web/dash/financials/setup', scope.formModel );
			}
			else {
				promise = Api.sendRequest( '/web/dash/financials/save', scope.formModel );
			}

			return promise.then( function( response )
			{
				if ( response.success !== false ) {
					angular.extend( scope, response );
					angular.extend( scope, { isLoaded: true } );
				}

				return response;
			} );
		};

	};


	// I don't know how to work this. ^AG
	/*form.onSubmit = function( scope )
	{

		var promise;
		if ( !scope.account ) {
			promise = Api.sendRequest( '/web/dash/financials/setup', scope.formModel );
		}
		else {
			promise = Api.sendRequest( '/web/dash/financials/save', scope.formModel, { file: scope.formModel.verification_document_0 , allowComplexData: ['legal_entity.additional_owners'] });
		}

		return promise.then( function( response )
		{
			if ( response.success !== false ) {
				angular.extend( scope, response );
				angular.extend( scope, { isLoaded: true } );
			}

			return response;
		} );
	};*/

	return form;
} );
