import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiOverview: RouteRecordRaw = {
	name: 'dash.games.manage.api.overview',
	path: '',
	component: () =>
		import(
			'~app/views/dashboard/games/manage/api/overview/RouteDashGamesManageApiOverview.vue'
		),
	children: [
		{
			path: '/dashboard/developer/games/achievements/:id(\\d+)',
			redirect: { name: 'dash.games.manage.api.overview' },
		},
	],
};
