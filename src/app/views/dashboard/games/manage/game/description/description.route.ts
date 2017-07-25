import VueRouter from 'vue-router';

export const routeDashGamesManageGameDescription: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.description',
	path: 'description',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameDescription" */ './description'),
	children: [
		{
			path: '/dashboard/developer/games/description/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.description' },
		},
	],
};
