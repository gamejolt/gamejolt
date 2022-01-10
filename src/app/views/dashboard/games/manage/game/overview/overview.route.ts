import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameOverview: RouteRecordRaw = {
	name: 'dash.games.manage.game.overview',
	path: '',
	component: () => import('./overview.vue'),
	children: [
		{
			path: '/dashboard/developer/games/view/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.overview' },
		},
	],
};
