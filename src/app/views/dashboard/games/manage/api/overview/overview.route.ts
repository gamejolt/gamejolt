import VueRouter from 'vue-router';

export const routeDashGamesManageApiOverview: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.overview',
	path: '/dashboard/games/:id(\\d+)/api',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageApiOverview" */ './overview'),
	children: [
		{
			path: '/dashboard/developer/games/achievements/:id(\\d+)',
			redirect: { name: 'dash.games.manage.api.overview' },
		},
	],
};
