import VueRouter from 'vue-router';

export const routeSearchUsers: VueRouter.RouteConfig = {
	name: 'search.users',
	path: 'users',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearchUsers" */ './users'),
};
