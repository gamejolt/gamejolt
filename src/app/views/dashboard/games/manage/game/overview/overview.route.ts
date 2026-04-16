import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameOverview: RouteRecordRaw = {
	name: 'dash.games.manage.game.overview',
	path: '',
	component: () => import('~app/views/dashboard/games/manage/game/overview/RouteDashGamesManageGameOverview.vue'),
	children: [
		{
			path: '/dashboard/developer/games/view/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.overview' },
		},
	],
};
