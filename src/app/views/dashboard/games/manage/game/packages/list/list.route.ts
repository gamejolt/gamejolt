import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGamePackagesList: RouteConfig = {
	name: 'dash.games.manage.game.packages.list',
	path: 'packages',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGamePackagesList" */ './list'),
};
