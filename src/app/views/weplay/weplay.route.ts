import { RouteConfig } from 'vue-router';

export const routeWeplay: RouteConfig = {
	name: 'weplay',
	path: '/weplay',
	component: () => import(/* webpackChunkName: "routeweplay" */ './weplay.vue'),
};
