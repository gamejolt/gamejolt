angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing.partners', {
		url: '/partners',
		controller: 'Landing.PartnersCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/landing/partners/partners.html',
	} );
} );
