angular.module( 'App.Views' ).controller( 'Dashboard.Account.AvatarCtrl', function( $scope, $translate, Translate )
{
	Translate.pageTitle( 'dash.avatar.page_title' );
	$scope.accountCtrl.heading = $translate.instant( 'dash.avatar.heading' );
} );
