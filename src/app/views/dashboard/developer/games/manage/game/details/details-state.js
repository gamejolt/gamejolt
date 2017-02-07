angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/details/:id', '/dashboard/games/:id/details' );

	$stateProvider.state( 'dashboard.developer.games.manage.game.details', {
		url: '/details',
		controller: 'Dashboard.Developer.Games.Manage.Game.DetailsCtrl',
		controllerAs: 'detailsCtrl',
		templateUrl: require( './details.html' ),
	} );
} );
