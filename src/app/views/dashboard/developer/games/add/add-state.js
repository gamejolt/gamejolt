angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/add', '/dashboard/games/add' );

	$stateProvider.state( 'dashboard.developer.games.add', {
		url: '/add',
		controller: 'Dashboard.Developer.Games.AddCtrl',
		controllerAs: 'addCtrl',
		templateUrl: '/app/views/dashboard/developer/games/add/add.html',
	} );
} );
