import VueRouter from 'vue-router';

export const routeDashGamesManageGameOverview: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.overview',
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameOverview" */ './overview'),
	children: [
		{
			path: '/dashboard/developer/games/view/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.overview' },
		},
	],
};
