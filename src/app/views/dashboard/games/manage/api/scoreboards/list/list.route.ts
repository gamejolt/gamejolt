import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiScoreboardsList: RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.list',
	path: 'scoreboards',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiScoreboardsList" */ './list.vue'),
};
