angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'legal.privacy', {
		url: '/privacy',
		controller: 'Legal_PrivacyCtrl',
		controllerAs: 'privacyCtrl',
		templateUrl: '/app/views/legal/privacy/privacy.html',
	} );
} );
