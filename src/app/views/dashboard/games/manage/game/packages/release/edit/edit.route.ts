import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGamePackageReleaseEdit: RouteConfig = {
	name: 'dash.games.manage.game.packages.release.edit',
	path: 'packages/:packageId(\\d+)/releases/:releaseId(\\d+)/edit',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGamePackageReleaseEdit" */ './edit.vue'),
};
