import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesAdd: RouteRecordRaw = {
	name: 'dash.games.add',
	path: 'add',
	component: () => import('./add.vue'),
	children: [
		{
			path: '/dashboard/developer/games/add',
			redirect: { name: 'dash.games.add' },
		},
	],
};
