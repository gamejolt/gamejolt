import { RouteConfig } from 'vue-router';

import { routeProfileOverview } from './overview/overview.route';
import { routeProfileVideosList } from './videos/list/list.route';
import { routeProfileLibrary } from './library/library.route';

export const routeProfile: RouteConfig = {
	path: '/@:username',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfile" */ './profile'),
	children: [routeProfileOverview, routeProfileLibrary, routeProfileVideosList],
};
