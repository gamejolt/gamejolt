angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api.settings', {
		url: '/settings',
		controller: 'Dashboard.Developer.Games.Manage.Api.SettingsCtrl',
		controllerAs: 'settingsCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/settings/settings.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/api/settings/' + $stateParams.id );
			}
		}
	} );
} );
