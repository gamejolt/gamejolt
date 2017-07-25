import VueRouter from 'vue-router';
import { routeDashGamesManageGamePackagesEditWidget } from './widget/widget.route';

export const routeDashGamesManageGamePackagesEdit: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.edit',
	path: 'packages/:packageId(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGamePackagesEdit" */ './edit'),
	children: [routeDashGamesManageGamePackagesEditWidget],
};
