angular.module( 'App.Forms' ).directive( 'gjFormToken', function( $q, Form, Api )
{
	var form = new Form( {
		template: '/app/components/forms/token/token.html'
	} );

	form.scope.token = '=gjToken';

	form.onInit = function( scope )
	{
		scope.formModel.token = scope.token;
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/token/save', { token: scope.formModel.token } ).then( function( response )
		{
			if ( !response.success ) {
				return $q.reject( response );
			}

			scope.formModel.token = response.token;
		} );
	};

	return form;
} );
