import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiSettings: RouteRecordRaw = {
	name: 'dash.games.manage.api.settings',
	path: 'settings',
	component: () =>
		import(
			'~app/views/dashboard/games/manage/api/settings/RouteDashGamesManageApiSettings.vue'
		),
};
