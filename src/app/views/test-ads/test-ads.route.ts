import { RouteConfig } from 'vue-router';

export const routeTestAds: RouteConfig = {
	name: 'test-ads',
	path: '/test-ads',
	component: () => import(/* webpackChunkName: "routeTestAds" */ './test-ads'),
};
