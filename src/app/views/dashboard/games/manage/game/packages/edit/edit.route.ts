import { RouteRecordRaw } from 'vue-router';
import { routeDashGamesManageGamePackagesEditWidget } from './widget/widget.route';

export const routeDashGamesManageGamePackagesEdit: RouteRecordRaw = {
	name: 'dash.games.manage.game.packages.edit',
	path: 'packages/:packageId(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGamePackagesEdit" */ './edit.vue'),
	children: [routeDashGamesManageGamePackagesEditWidget],
};
