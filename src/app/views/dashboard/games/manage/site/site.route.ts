import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageSite: VueRouter.RouteConfig = {
	name: 'dash.games.manage.site',
	path: 'site',
	props: true,
	component: () => asyncComponentLoader(import('./site')),
};
