angular.module( 'App.Forms' ).directive( 'gjFormResetPassword', function( $q, Form, Api, Connection )
{
	var form = new Form( {
		template: '/auth/components/forms/reset-password/reset-password.html'
	} );

	form.scope.userId = '=gjUserId';
	form.scope.key = '=gjKey';

	form.onInit = function( scope )
	{
		scope.Connection = Connection;
		scope.formModel.password = '';
	};

	form.onSubmit = function( scope )
	{
		// Will return a bad request if the user ID or key is invalid.
		// Since we checked it in the controller, let's let it process the payload and show an error page.
		return Api.sendRequest( '/web/auth/reset-password/' + scope.userId, {
			key: scope.key,
			password: scope.formModel.password
		} )
		.then( function( response )
		{
			if ( !response.success ) {
				return $q.reject( response );
			}
		} );
	};

	return form;
} );
