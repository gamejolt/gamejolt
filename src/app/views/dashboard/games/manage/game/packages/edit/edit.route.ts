import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGamePackagesEdit: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.edit',
	path: ':packageId(\\d+)',
	props: true,
	component: () => asyncComponentLoader(import('./edit')),
};
