angular.module( 'App.Forms' ).directive( 'gjFormToken', function( $q, Form, Api )
{
	var form = new Form( {
		template: require( './token.html' )
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
			if ( response.success !== false ) {
				scope.formModel.token = response.token;
			}

			return response;
		} );
	};

	return form;
} );
