import { RouteConfig } from 'vue-router';

export const routeDiscoverDevlogsOverview: RouteConfig = {
	name: 'discover.devlogs.overview',
	path: '/devlogs',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverDevlogs" */ './overview'),
};
