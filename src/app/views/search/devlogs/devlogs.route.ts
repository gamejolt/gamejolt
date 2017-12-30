import { RouteConfig } from 'vue-router';

export const routeSearchDevlogs: RouteConfig = {
	name: 'search.devlogs',
	path: 'devlogs',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearch" */ './devlogs'),
};
