import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoresList: RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.list',
	path: 'scoreboards/:table(\\d+)',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiScoreboardsScoresList" */ './list'),
};
