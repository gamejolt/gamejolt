import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGamePackagesList: RouteRecordRaw = {
	name: 'dash.games.manage.game.packages.list',
	path: 'packages',
	component: () => import('./list.vue'),
};
