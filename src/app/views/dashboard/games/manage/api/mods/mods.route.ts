import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiMods: RouteRecordRaw = {
	name: 'dash.games.manage.api.mods',
	path: 'mods',
	component: () => import('./mods.vue'),
};
