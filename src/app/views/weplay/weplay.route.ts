import { RouteConfig } from 'vue-router';

export const routeWeplay: RouteConfig = {
	name: 'weplay',
	path: '/stajoltia',
	component: () => import(/* webpackChunkName: "routeweplay" */ './weplay.vue'),
};
