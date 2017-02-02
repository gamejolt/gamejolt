angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.account.linked-accounts.linking', {
		url: '/linking?token',
		views: {
			'main-content': {
				templateUrl: require( './linking.html' ),
				controller: 'Dashboard.Account.LinkedAccounts.LinkingCtrl',
				controllerAs: 'linkingCtrl',
			}
		}
	} );
} );
