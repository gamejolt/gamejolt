angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'library.installed', {
		url: '/installed',
		controller: 'Library.InstalledCtrl',
		controllerAs: 'installedCtrl',
		templateUrl: '/app/views/library/installed/installed.html',
		data: {
			availableOffline: true,
		},
	} );
} );
