angular.module( 'App.Views' ).controller( 'Dashboard.Account.FinancialsCtrl', function( $scope, App, payload )
{
	App.title = 'Set Up Financials'
	$scope.accountCtrl.heading = 'Your Financial Info';

	this.account = payload.account;
	console.log( payload );
} );
