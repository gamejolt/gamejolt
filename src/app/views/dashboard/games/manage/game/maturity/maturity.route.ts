import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameMaturity: RouteConfig = {
	name: 'dash.games.manage.game.maturity',
	path: 'maturity',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameMaturity" */ './maturity'),
};
