import { RouteConfig } from 'vue-router';

export const routeFireside: RouteConfig = {
	name: 'fireside',
	path: '/fireside/:hash',
	component: () => import(/* webpackChunkName: "routeFireside" */ './fireside.vue'),
};
