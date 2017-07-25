import VueRouter from 'vue-router';

import { routeDiscoverDevlogsOverview } from './overview/overview.route';
import { routeDiscoverDevlogsGames } from './games/games.route';

export const routeDiscoverDevlogs: VueRouter.RouteConfig = {
	name: 'discover.devlogs',
	path: '/devlogs',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverDevlogs" */ './devlogs'),
	children: [routeDiscoverDevlogsOverview, routeDiscoverDevlogsGames],
};
