import VueRouter from 'vue-router';

export const routeDiscoverHome: VueRouter.RouteConfig = {
	name: 'discover.home',
	path: '',
	props: true,
	component: () => import('./home'),
};
