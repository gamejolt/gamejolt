angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.game.settings', {
		url: '/settings',
		controller: 'Dashboard.Developer.Games.Manage.Game.SettingsCtrl',
		controllerAs: 'settingsCtrl',
		templateUrl: require( './settings.html' ),
	} );
} );
