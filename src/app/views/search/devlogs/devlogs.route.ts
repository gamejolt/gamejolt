import VueRouter from 'vue-router';

export const routeSearchDevlogs: VueRouter.RouteConfig = {
	name: 'search.devlogs',
	path: 'devlogs',
	props: true,
	component: () => import('./devlogs'),
};
