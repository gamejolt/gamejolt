import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiMods: RouteConfig = {
	name: 'dash.games.manage.api.mods',
	path: 'mods',
	component: () => import(/* webpackChunkName: "routeDashGamesManageApiMods" */ './mods.vue'),
};
