import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiTrophies: RouteConfig = {
	name: 'dash.games.manage.api.trophies.list',
	path: 'trophies',
	component: () => import(/* webpackChunkName: "routeDashGamesManageApiTrophies" */ './trophies'),
};
