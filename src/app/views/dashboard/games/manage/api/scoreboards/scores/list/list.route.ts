import VueRouter from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoresList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.list',
	path: 'scoreboards/:table(\\d+)',
	props: true,
	component: () => import('./list'),
};
