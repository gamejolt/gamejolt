import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameDetails: RouteRecordRaw = {
	name: 'dash.games.manage.game.details',
	path: 'details',
	component: () => import('./RouteDashGamesManageGameDetails.vue'),
	children: [
		{
			path: '/dashboard/developer/games/details/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.details' },
		},
	],
};
