import { RouteConfig } from 'vue-router';

export const routeDashGamesManageKeyGroupsList: RouteConfig = {
	name: 'dash.games.manage.key-groups.list',
	path: 'keys',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageKeyGroupsList" */ './list.vue'),
};
