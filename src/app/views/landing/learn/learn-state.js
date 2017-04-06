angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing.learn', {
		url: '/learn',
		controller: 'Landing.LearnCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/landing/learn/learn.html',
	} );
} );
