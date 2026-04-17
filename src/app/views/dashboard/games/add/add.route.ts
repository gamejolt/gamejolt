import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesAdd: RouteRecordRaw = {
	name: 'dash.games.add',
	path: 'add',
	component: () => import('~app/views/dashboard/games/add/RouteDashGamesAdd.vue'),
	children: [
		{
			path: '/dashboard/developer/games/add',
			redirect: { name: 'dash.games.add' },
		},
	],
};
