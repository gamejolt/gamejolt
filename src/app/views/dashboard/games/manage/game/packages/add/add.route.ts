import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGamePackagesAdd: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.add',
	path: 'packages/add',
	props: true,
	component: () => asyncComponentLoader(import('./add')),
};
