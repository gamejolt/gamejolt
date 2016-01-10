angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view.trophies.list', {
		url: '/trophies',
		controller: 'Discover.Games.View.Trophies.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/games/view/trophies/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/games/trophies/' + $stateParams.id );
			}
		}
	} );
} );
