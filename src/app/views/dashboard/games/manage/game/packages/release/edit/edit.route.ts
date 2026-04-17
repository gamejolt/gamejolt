import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGamePackageReleaseEdit: RouteRecordRaw = {
	name: 'dash.games.manage.game.packages.release.edit',
	path: 'packages/:packageId(\\d+)/releases/:releaseId(\\d+)/edit',
	component: () =>
		import(
			'~app/views/dashboard/games/manage/game/packages/release/edit/RouteDashGamesManageGamePackagesReleaseEdit.vue'
		),
};
