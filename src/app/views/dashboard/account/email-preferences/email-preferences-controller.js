angular.module( 'App.Views' ).controller( 'Dashboard.Account.EmailPreferencesCtrl', function( $scope, App, User, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'dash.email_prefs.page_title' );
	$scope.accountCtrl.heading = gettextCatalog.getString( 'dash.email_prefs.heading' );

	this.user = new User( payload.user );
} );
