import VueRouter from 'vue-router';

export const routeDiscoverDevlogsOverview: VueRouter.RouteConfig = {
	name: 'discover.devlogs.overview',
	path: '/devlogs',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverDevlogs" */ './overview'),
};
