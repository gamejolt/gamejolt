angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view.devlog.list', {
		url: '',
		controller: 'Discover.Games.View.Devlog.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/games/view/devlog/list/list.html',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/discover/games/devlog/' + $stateParams['id'] );
			}
		}
	} );
} );
