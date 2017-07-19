import VueRouter from 'vue-router';

export const routeDashGamesManageGamePackageReleaseEdit: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.release.edit',
	path: 'packages/:packageId(\\d+)/releases/:releaseId(\\d+)/edit',
	props: true,
	component: () => import('./edit'),
};
