import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameDesign: RouteConfig = {
	name: 'dash.games.manage.game.design',
	path: 'design',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGameDesign" */ './design'),
};
