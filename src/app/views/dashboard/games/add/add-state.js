angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/add', '/dashboard/games/add' );

	$stateProvider.state( 'dash.games.add', {
		url: '/add',
		controller: 'Dashboard.Developer.Games.AddCtrl',
		controllerAs: 'addCtrl',
		templateUrl: require( './add.html' ),
	} );
} );
