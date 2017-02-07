angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/profile/email-preferences', '/dashboard/email-preferences' );

	$stateProvider.state( 'dashboard.account.email-preferences', {
		url: '/email-preferences',
		controller: 'Dashboard.Account.EmailPreferencesCtrl',
		controllerAs: 'emailPreferencesCtrl',
		templateUrl: require( './email-preferences.html' ),
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/email-preferences' );
			}
		}
	} );
} );
