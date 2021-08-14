import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageKeyGroupsList: RouteRecordRaw = {
	name: 'dash.games.manage.key-groups.list',
	path: 'keys',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageKeyGroupsList" */ './list.vue'),
};
