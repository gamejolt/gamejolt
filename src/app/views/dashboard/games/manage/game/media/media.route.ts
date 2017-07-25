import VueRouter from 'vue-router';

export const routeDashGamesManageGameMedia: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.media',
	path: 'media',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameMedia" */ './media'),
};
