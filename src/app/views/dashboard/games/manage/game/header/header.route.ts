import VueRouter from 'vue-router';

export const routeDashGamesManageGameHeader: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.header',
	path: 'header',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameHeader" */ './header'),
};
