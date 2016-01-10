angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game.settings', {
		url: '/settings',
		controller: 'Dashboard.Developer.Games.Manage.Game.SettingsCtrl',
		controllerAs: 'settingsCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/settings/settings.html',
	} );
} );
