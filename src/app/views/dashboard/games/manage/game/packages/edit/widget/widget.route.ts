import VueRouter from 'vue-router';

export const routeDashGamesManageGamePackagesEditWidget: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.edit.widget',
	path: 'widget',
	props: true,
	component: () => import('./widget'),
};
