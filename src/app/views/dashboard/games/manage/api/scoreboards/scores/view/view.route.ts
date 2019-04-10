import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoresView: RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.view',
	path: 'scoreboards/:table(\\d+)/:score(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiScoreboardsScoresView" */ './view.vue'),
};
