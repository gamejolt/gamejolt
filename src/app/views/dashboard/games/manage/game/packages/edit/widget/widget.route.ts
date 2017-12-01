import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGamePackagesEditWidget: RouteConfig = {
	name: 'dash.games.manage.game.packages.edit.widget',
	path: 'widget',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGamePackagesEditWidget" */ './widget'),
};
