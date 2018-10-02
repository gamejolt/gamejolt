import { RouteConfig } from 'vue-router';

export const routeDashGamesManageDevlog: RouteConfig = {
	name: 'dash.games.manage.devlog',
	path: 'devlog',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageDevlog" */ './devlog'),
};
