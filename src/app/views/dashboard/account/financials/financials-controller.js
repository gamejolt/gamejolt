angular.module( 'App.Views' ).controller( 'Dashboard.Account.FinancialsCtrl', function( $scope, App, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'Set Up Financials' );

	$scope.accountCtrl.heading = gettextCatalog.getString( 'Your Financial Info' );
} );
