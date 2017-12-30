import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameHeader: RouteConfig = {
	name: 'dash.games.manage.game.header',
	path: 'header',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameHeader" */ './header'),
};
