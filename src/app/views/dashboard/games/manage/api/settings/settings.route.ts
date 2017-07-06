import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiSettings: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.settings',
	path: 'settings',
	props: true,
	component: () => asyncComponentLoader(import('./settings')),
};
