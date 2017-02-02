angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/description/:id', '/dashboard/games/:id/description' );

	$stateProvider.state( 'dashboard.developer.games.manage.game.description', {
		url: '/description',
		controller: 'Dashboard.Developer.Games.Manage.Game.DescriptionCtrl',
		controllerAs: 'descriptionCtrl',
		templateUrl: require( './description.html' ),
	} );
} );
