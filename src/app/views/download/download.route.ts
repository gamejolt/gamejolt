import { RouteConfig } from 'vue-router';

export const routeDownload: RouteConfig = {
	name: 'download',
	path: '/get/:type(build|soundtrack)',
	component: () => import(/* webpackChunkName: "routeDownload" */ './download.vue'),
};
