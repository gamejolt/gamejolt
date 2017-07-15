import VueRouter from 'vue-router';

export const routeDashGamesManageGameMusic: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.music',
	path: 'music',
	props: true,
	component: () => import('./music'),
	children: [
		{
			path: '/dashboard/developer/games/soundtracks/:id(\\d+)/',
			redirect: { name: 'dash.games.manage.game.music' },
		},
	],
};

// angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
// {
// 	$urlRouterProvider.when( '/dashboard/developer/games/soundtracks/:id/', '/dashboard/developer/games/:id/music' );

// 	$stateProvider.state( 'dash.games.manage.game.music', {
// 		url: '/music',
// 		controller: 'Dashboard.Developer.Games.Manage.Game.MusicCtrl',
// 		controllerAs: 'musicCtrl',
// 		templateUrl: require( './music.html' ),
// 		resolve: {
// 			payload: function( Api, $stateParams )
// 			{
// 				return Api.sendRequest( '/web/dash/developer/games/music/' + $stateParams.id );
// 			}
// 		}
// 	} );
// } );
