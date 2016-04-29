angular.module( 'App.Views' ).directive( 'gjFormTwitterEmail', function( $q, Api, Form )
{
	var form = new Form( {
		template: '/auth/views/auth/linked-account/twitter/finalize/twitter-email-form.html'
	} );

	form.scope.state = '=';

	form.onInit = function( scope )
	{
		scope.formState.duplicateEmail = false;
		scope.onChanged = function()
		{
			scope.formState.duplicateEmail = false;
		};
	};

	/**
	 * Twitter has the unique quality of not giving us an email address.
	 * Because of this after the auth data is set up, we need to gather their email in a form
	 * and then POST it to create the account.
	 * The token data should be in their session, so all that's needed is the email address.
	 */
	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/auth/twitter/create-account?state=' + scope.state, scope.formModel ).then( function( response )
		{
			if ( !response.success ) {
				if ( response.reason && response.reason == 'duplicate-email' ) {
					scope.formState.duplicateEmail = true;
				}
			}

			return response;
		} );
	};

	return form;
} );
