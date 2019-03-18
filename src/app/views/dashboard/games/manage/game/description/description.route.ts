import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameDescription: RouteConfig = {
	name: 'dash.games.manage.game.description',
	path: 'description',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameDescription" */ './description.vue'),
	children: [
		{
			path: '/dashboard/developer/games/description/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.description' },
		},
	],
};
