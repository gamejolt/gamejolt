import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';
import { routeDashGamesManageApiOverview } from './overview/overview.route';
import { routeDashGamesManageApiTrophies } from './trophies/trophies.route';

export const routeDashGamesManageApi: VueRouter.RouteConfig = {
	path: 'api',
	props: true,
	component: () => asyncComponentLoader($import('./api')),
	children: [routeDashGamesManageApiOverview, routeDashGamesManageApiTrophies],
};
