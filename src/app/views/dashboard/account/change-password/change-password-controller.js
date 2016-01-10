angular.module( 'App.Views' ).controller( 'Dashboard.Account.ChangePasswordCtrl', function( $scope, $translate, Translate )
{
	Translate.pageTitle( 'dash.change_pass.page_title' );
	$scope.accountCtrl.heading = $translate.instant( 'dash.change_pass.heading' );
} );
