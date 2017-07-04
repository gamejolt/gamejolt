import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGamePackagesList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.packages.list',
	path: 'packages',
	props: true,
	component: () => asyncComponentLoader($import('./list')),
};
