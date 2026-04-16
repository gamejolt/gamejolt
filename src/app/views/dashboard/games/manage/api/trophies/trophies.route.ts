import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiTrophies: RouteRecordRaw = {
	name: 'dash.games.manage.api.trophies.list',
	path: 'trophies',
	component: () => import('~app/views/dashboard/games/manage/api/trophies/RouteDashGamesManageApiTrophies.vue'),
};
