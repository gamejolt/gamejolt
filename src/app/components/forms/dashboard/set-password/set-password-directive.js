angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardSetPassword', function( $q, Form, Api )
{
	var form = new Form( {
		template: require( './set-password.html' )
	} );

	form.onInit = function( scope )
	{
		scope.formModel.password = '';
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/account/set-password', { password: scope.formModel.password } );
	};

	return form;
} );
