angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api.trophies.list', {
		url: '/trophies',
		controller: 'Dashboard.Developer.Games.Manage.Api.Trophies.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: require( './list.html' ),
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/api/trophies/' + $stateParams.id );
			}
		}
	} );
} );
