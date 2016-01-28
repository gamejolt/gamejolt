angular.module( 'App.Views' ).controller( 'Dashboard.Account.AvatarCtrl', function( $scope, App, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.avatar.page_title' );
	$scope.accountCtrl.heading = gettextCatalog.getString( 'dash.avatar.heading' );
} );
