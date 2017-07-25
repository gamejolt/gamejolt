import VueRouter from 'vue-router';

export const routeKey: VueRouter.RouteConfig = {
	name: 'key',
	path: '/claim/:accessKey([a-zA-Z0-9]+)/:bundleGameId(\\d+)?',
	props: true,
	component: () => import(/* webpackChunkName: "routeKey" */ './key'),
};
