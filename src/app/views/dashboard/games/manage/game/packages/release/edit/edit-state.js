angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.game.packages.release.edit', {
		url: '/edit',
		templateUrl: require( './edit.html' ),
		controller: 'Dashboard.Developer.Games.Manage.Game.Packages.Release.EditCtrl',
		controllerAs: 'editCtrl',
	} );
} );
