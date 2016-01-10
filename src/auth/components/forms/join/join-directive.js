angular.module( 'App.Forms' ).directive( 'gjFormJoin', function( $q, Api, Form, Connection )
{
	var form = new Form( {
		template: '/auth/components/forms/join/join.html'
	} );

	form.onInit = function( scope )
	{
		scope.Connection = Connection;
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/auth/join', scope.formModel ).then( function( response )
		{
			if ( !response.success ) {
				return $q.reject( response );
			}
		} );
	};

	return form;
} );
