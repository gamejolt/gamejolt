import { RouteConfig } from 'vue-router';

export const routeDashGamesAdd: RouteConfig = {
	name: 'dash.games.add',
	path: 'add',
	component: () => import(/* webpackChunkName: "routeDashGamesAdd" */ './add'),
	children: [
		{
			path: '/dashboard/developer/games/add',
			redirect: { name: 'dash.games.add' },
		},
	],
};
