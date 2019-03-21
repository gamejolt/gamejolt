import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameMaturity: RouteConfig = {
	name: 'dash.games.manage.game.maturity',
	path: 'maturity',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameMaturity" */ './maturity.vue'),
};
