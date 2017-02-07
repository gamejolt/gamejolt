angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'library.installed', {
		url: '^/installed',
		controller: 'Library.InstalledCtrl',
		controllerAs: 'installedCtrl',
		templateUrl: require( './installed.html' ),
		data: {
			availableOffline: true,
		},
	} );
} );
