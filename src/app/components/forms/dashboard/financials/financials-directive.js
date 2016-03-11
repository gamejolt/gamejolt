angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancials', function( $q, Form, Api )
{
	var form = new Form( {
		template: '/app/components/forms/dashboard/financials/financials.html'
	} );

	form.scope.account = '=';

	form.onInit = function( scope )
	{
		scope.formModel.percentageSplit = 10;

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
			scope.isLoaded = true;
			angular.extend( scope, payload );
		} );

		scope.hasField = function( field )
		{
			if ( !scope.fields ) {
				return undefined;
			}
			return scope.fields.minimum.indexOf( field ) != -1 || scope.fields.additional.indexOf( field ) != -1;
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
				if ( scope.formModel.percentageSplit > 10 ) {
					scope.formModel.percentageSplit = 10;
				}
            }
		};
	};

	form.onSubmit = function( scope )
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
			if ( !response.success ) {
				return $q.reject( response );
			}

			return response;
		} );
	};

	return form;
} );
