import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiOverview: RouteRecordRaw = {
	name: 'dash.games.manage.api.overview',
	path: '',
	component: () => import('./RouteDashGamesManageApiOverview.vue'),
	children: [
		{
			path: '/dashboard/developer/games/achievements/:id(\\d+)',
			redirect: { name: 'dash.games.manage.api.overview' },
		},
	],
};
