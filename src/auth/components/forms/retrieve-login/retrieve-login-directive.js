angular.module( 'App.Forms' ).directive( 'gjFormRetrieveLogin', function( $q, Api, Form, Connection )
{
	var form = new Form( {
		template: require( './retrieve-login.html' )
	} );

	form.onInit = function( scope )
	{
		scope.Connection = Connection;

		scope.formState.invalidEmail = false;
		scope.onChanged = function()
		{
			scope.formState.invalidEmail = false;
		};
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/auth/retrieve', scope.formModel ).then( function( response )
		{
			if ( response.success === false ) {
				if ( response.reason && response.reason == 'invalid-email' ) {
					scope.formState.invalidEmail = true;
				}
			}
			
			return response;
		} );
	};

	return form;
} );
