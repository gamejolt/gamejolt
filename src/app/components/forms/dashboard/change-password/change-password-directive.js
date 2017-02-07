angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardChangePassword', function( $q, Form, Api )
{
	var form = new Form( {
		template: require( './change-password.html' ),
		resetOnSubmit: true,
	} );

	form.onInit = function( scope )
	{
		scope.formModel.old_password = '';
		scope.formModel.password = '';
		scope.formModel.confirm_password = '';
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/account/set-password', {
			old_password: scope.formModel.old_password,
			password: scope.formModel.password,
		} );
	};

	return form;
} );
