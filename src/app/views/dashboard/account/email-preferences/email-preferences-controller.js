angular.module( 'App.Views' ).controller( 'Dashboard.Account.EmailPreferencesCtrl', function( $scope, $translate, Translate, User, payload )
{
	Translate.pageTitle( 'dash.email_prefs.page_title' );
	$scope.accountCtrl.heading = $translate.instant( 'dash.email_prefs.heading' );

	this.user = new User( payload.user );
} );
