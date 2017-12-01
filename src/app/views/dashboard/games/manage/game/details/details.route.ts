import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameDetails: RouteConfig = {
	name: 'dash.games.manage.game.details',
	path: 'details',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameDetails" */ './details'),
	children: [
		{
			path: '/dashboard/developer/games/details/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.details' },
		},
	],
};
