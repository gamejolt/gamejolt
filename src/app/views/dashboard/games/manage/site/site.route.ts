import { RouteConfig } from 'vue-router';

export const routeDashGamesManageSite: RouteConfig = {
	name: 'dash.games.manage.site',
	path: 'site/:siteTab?',
	component: () => import(/* webpackChunkName: "routeDashGamesManageSite" */ './site'),
};
