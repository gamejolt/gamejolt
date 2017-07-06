import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiTrophies: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.trophies.list',
	path: 'trophies',
	props: true,
	component: () => asyncComponentLoader(import('./trophies')),
};
