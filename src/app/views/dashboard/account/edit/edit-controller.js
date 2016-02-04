angular.module( 'App.Views' ).controller( 'Dashboard.Account.EditCtrl', function( $scope, App, Api, Growls, Scroll, gettextCatalog )
{
	App.title = gettextCatalog.getString( 'dash.profile.edit.page_title' );
	$scope.accountCtrl.heading = gettextCatalog.getString( 'dash.profile.edit.heading' );

	this.onProfileSaved = function()
	{
		Growls.add( 'success', 'Your information has been updated. Right on!' );
		Scroll.to( 0 );
	};
} );
