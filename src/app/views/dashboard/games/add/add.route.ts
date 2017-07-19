import VueRouter from 'vue-router';

export const routeDashGamesAdd: VueRouter.RouteConfig = {
	name: 'dash.games.add',
	path: 'add',
	props: true,
	component: () => import('./add'),
	children: [
		{
			path: '/dashboard/developer/games/add',
			redirect: { name: 'dash.games.add' },
		},
	],
};
