import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { routeDiscoverDevlogsOverview } from './overview/overview.route';
import { routeDiscoverDevlogsGames } from './games/games.route';

export const routeDiscoverDevlogs: VueRouter.RouteConfig = {
	name: 'discover.devlogs',
	path: '/devlogs',
	component: () => asyncComponentLoader( $import( './devlogs' ) ),
	children: [
		routeDiscoverDevlogsOverview,
		routeDiscoverDevlogsGames,
	],
};
