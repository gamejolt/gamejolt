import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameMaturity: RouteRecordRaw = {
	name: 'dash.games.manage.game.maturity',
	path: 'maturity',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameMaturity" */ './maturity.vue'),
};
