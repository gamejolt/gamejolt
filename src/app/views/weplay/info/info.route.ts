import { RouteConfig } from 'vue-router';

export const routeWeplayInfo: RouteConfig = {
	name: 'weplay.info',
	path: 'about',
	component: () => import(/* webpackChunkName: "routeWeplay" */ './info.vue'),
};
