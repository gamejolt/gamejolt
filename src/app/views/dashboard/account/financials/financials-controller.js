angular.module( 'App.Views' ).controller( 'Dashboard.Account.FinancialsCtrl', function( $scope, App, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'Marketplace Account Setup' );

	$scope.accountCtrl.heading = gettextCatalog.getString( 'Marketplace Account Setup' );
} );
