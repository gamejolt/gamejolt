import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameMusic: RouteConfig = {
	name: 'dash.games.manage.game.music',
	path: 'music',
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameMusic" */ './music.vue'),
	children: [
		{
			path: '/dashboard/developer/games/soundtracks/:id(\\d+)/',
			redirect: { name: 'dash.games.manage.game.music' },
		},
	],
};
