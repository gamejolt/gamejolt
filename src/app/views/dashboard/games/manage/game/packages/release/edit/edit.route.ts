import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGamePackageReleaseEdit: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.release.edit',
	path: 'packages/:packageId(\\d+)/releases/:releaseId(\\d+)/edit',
	props: true,
	component: () => asyncComponentLoader(import('./edit')),
};
