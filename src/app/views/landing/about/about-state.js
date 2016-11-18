angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing.about', {
		url: '/about',
		controller: 'Landing.AboutCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/landing/about/about.html',
	} );
} );
