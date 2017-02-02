angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'settings', {
		url: '/settings',
		controller: 'SettingsCtrl',
		controllerAs: 'settingsCtrl',
		templateUrl: require( './settings.html' ),
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			payload: function( User )
			{
				return User.touch();
			}
		},
		data: {
			availableOffline: true,
		},
	} );
} );
