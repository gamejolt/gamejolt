import VueRouter from 'vue-router';

export const routeDashGamesManageGamePackagesList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.list',
	path: 'packages',
	props: true,
	component: () => import('./list'),
};
