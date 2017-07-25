import VueRouter from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoreUser: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.user',
	path: 'scoreboards/:table(\\d+)/user/:user(\\d+)',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiScoreboardsScoreUser" */ './user'),
};
