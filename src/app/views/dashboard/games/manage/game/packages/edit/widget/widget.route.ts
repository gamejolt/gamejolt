import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGamePackagesEditWidget: RouteRecordRaw = {
	name: 'dash.games.manage.game.packages.edit.widget',
	path: 'widget',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGamePackagesEditWidget" */ './widget.vue'),
};
