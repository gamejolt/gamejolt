import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiOverview: RouteConfig = {
	name: 'dash.games.manage.api.overview',
	path: '/dashboard/games/:id(\\d+)/api',
	component: () => import(/* webpackChunkName: "routeDashGamesManageApiOverview" */ './overview'),
	children: [
		{
			path: '/dashboard/developer/games/achievements/:id(\\d+)',
			redirect: { name: 'dash.games.manage.api.overview' },
		},
	],
};
