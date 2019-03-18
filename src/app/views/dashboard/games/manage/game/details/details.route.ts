import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameDetails: RouteConfig = {
	name: 'dash.games.manage.game.details',
	path: 'details',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameDetails" */ './details.vue'),
	children: [
		{
			path: '/dashboard/developer/games/details/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.details' },
		},
	],
};
