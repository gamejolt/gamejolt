import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGamePackagesAdd: RouteRecordRaw = {
	name: 'dash.games.manage.game.packages.add',
	path: 'packages/add',
	component: () => import('./RouteDashGamesManageGamePackagesAdd.vue'),
};
