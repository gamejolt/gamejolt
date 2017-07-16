import VueRouter from 'vue-router';

export const routeDashGamesManageGamePackagesAdd: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.add',
	path: 'packages/add',
	props: true,
	component: () => import('./add'),
};
