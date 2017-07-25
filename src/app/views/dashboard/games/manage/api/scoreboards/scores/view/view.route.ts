import VueRouter from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoresView: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.view',
	path: 'scoreboards/:table(\\d+)/:score(\\d+)',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiScoreboardsScoresView" */ './view'),
};
