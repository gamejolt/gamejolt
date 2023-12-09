import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiScoreboardsList: RouteRecordRaw = {
	name: 'dash.games.manage.api.scoreboards.list',
	path: 'scoreboards',
	component: () => import('./RouteDashGamesManageApiScoreboardsList.vue'),
};
