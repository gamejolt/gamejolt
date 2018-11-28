import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameOverview: RouteConfig = {
	name: 'dash.games.manage.game.overview',
	path: '/dashboard/games/:id(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameOverview" */ './overview'),
	children: [
		{
			path: '/dashboard/developer/games/view/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.overview' },
		},
	],
};
