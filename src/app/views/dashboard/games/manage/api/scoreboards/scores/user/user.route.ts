import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoreUser: RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.user',
	path: 'scoreboards/:table(\\d+)/user/:user(\\d+)',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiScoreboardsScoreUser" */ './user'),
};
