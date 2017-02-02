angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game.packages.add', {
		url: '/add',
		controller: 'Dashboard.Developer.Games.Manage.Game.Packages.AddCtrl',
		controllerAs: 'addCtrl',
		templateUrl: require( './add.html' ),
	} );
} );
