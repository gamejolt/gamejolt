import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiSettings: RouteConfig = {
	name: 'dash.games.manage.api.settings',
	path: 'settings',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageApiSettings" */ './settings'),
};
