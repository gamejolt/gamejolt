import VueRouter from 'vue-router';

export const routeDashGamesManageGamePackagesEdit: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.edit',
	path: ':packageId(\\d+)',
	props: true,
	component: () => import('./edit'),
};
