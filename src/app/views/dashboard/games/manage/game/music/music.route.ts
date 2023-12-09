import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameMusic: RouteRecordRaw = {
	name: 'dash.games.manage.game.music',
	path: 'music',
	component: () => import('./RouteDashGamesManageGameMusic.vue'),
	children: [
		{
			path: '/dashboard/developer/games/soundtracks/:id(\\d+)/',
			redirect: { name: 'dash.games.manage.game.music' },
		},
	],
};
