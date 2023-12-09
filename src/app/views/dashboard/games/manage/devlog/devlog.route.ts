import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageDevlog: RouteRecordRaw = {
	name: 'dash.games.manage.devlog',
	path: 'devlog',
	component: () => import('./RouteDashGamesManageDevlog.vue'),
};
