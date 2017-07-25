import VueRouter from 'vue-router';

export const routeRetrieve: VueRouter.RouteConfig = {
	name: 'retrieve',
	path: '/claim/:input([gb]{1}\\-[0-9a-zA-Z]+)?',
	props: true,
	component: () => import(/* webpackChunkName: "routeRetrieve" */ './retrieve'),
};
