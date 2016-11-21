angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing.game-api', {
		url: '/game-api',
		controller: 'Landing.GameApiCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/landing/game-api/game-api.html',
	} );
} );
