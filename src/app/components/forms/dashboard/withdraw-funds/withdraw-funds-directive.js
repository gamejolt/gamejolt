angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardWithdrawFunds', function( $q, $state, Form, Api )
{
	var form = new Form( {
		template: '/app/components/forms/dashboard/withdraw-funds/withdraw-funds.html'
	} );

	form.scope.user = '=';
	form.scope.paypalEmail = '=';
	form.scope.minAmount = '=';
	form.scope.withdrawableAmount = '=';

	form.onInit = function( scope )
	{
		scope.$state = $state;
		scope.formModel.email_address = scope.paypalEmail;
		scope.formModel.amount = scope.withdrawableAmount;
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/funds/withdraw', scope.formModel );
	};

	return form;
} );
