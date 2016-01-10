angular.module( 'App.Forms' ).directive( 'gjFormRetrieveLogin', function( $q, Api, Form, Connection )
{
	var form = new Form( {
		template: '/auth/components/forms/retrieve-login/retrieve-login.html'
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
			if ( !response.success ) {

				if ( response.reason && response.reason == 'invalid-email' ) {
					scope.formState.invalidEmail = true;
				}

				return $q.reject( response );
			}
		} );
	};

	return form;
} );
