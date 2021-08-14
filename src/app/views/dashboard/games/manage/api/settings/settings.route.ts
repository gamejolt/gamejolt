import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiSettings: RouteRecordRaw = {
	name: 'dash.games.manage.api.settings',
	path: 'settings',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiSettings" */ './settings.vue'),
};
