angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Account.ChangePasswordCtrl', function( $scope, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.change_pass.page_title' );
	$scope.accountCtrl.heading = gettextCatalog.getString( 'dash.change_pass.heading' );
} );
