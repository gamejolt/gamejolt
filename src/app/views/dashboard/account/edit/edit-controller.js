angular.module( 'App.Views' ).controller( 'Dashboard.Account.EditCtrl', function( $scope, $translate, Translate, Api, Growls, Scroll )
{
	Translate.pageTitle( 'dash.profile.edit.page_title' );
	$scope.accountCtrl.heading = $translate.instant( 'dash.profile.edit.heading' );

	this.onProfileSaved = function()
	{
		Growls.add( 'success', 'Your information has been updated. Right on!' );
		Scroll.to( 0 );
	};
} );
