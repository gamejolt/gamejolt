angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.account.edit', {
		url: '/profile/edit',
		controller: 'Dashboard.Account.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: require( './edit.html' ),
	} );
} );
