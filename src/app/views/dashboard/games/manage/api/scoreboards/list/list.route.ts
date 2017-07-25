import VueRouter from 'vue-router';

export const routeDashGamesManageApiScoreboardsList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.list',
	path: 'scoreboards',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiScoreboardsList" */ './list'),
};
