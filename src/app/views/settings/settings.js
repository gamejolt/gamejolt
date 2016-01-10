angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'settings', {
		url: '/settings',
		controller: 'SettingsCtrl',
		controllerAs: 'settingsCtrl',
		templateUrl: '/app/views/settings/settings.html',
	} );
} );
