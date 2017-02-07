angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view.devlog.list', {
		url: '',
		controller: 'Discover.Games.View.Devlog.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: require( './list.html' ),
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/discover/games/devlog/' + $stateParams['id'] );
			}
		}
	} );
} );
