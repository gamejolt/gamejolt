import VueRouter from 'vue-router';
import RouteDiscoverHome from './home';

export const routeDiscoverHome: VueRouter.RouteConfig = {
	name: 'discover.home',
	path: '',
	props: true,
	component: RouteDiscoverHome,
};
