import { RouteRecordRaw } from 'vue-router';

export const routeFireside: RouteRecordRaw = {
	name: 'fireside',
	path: '/fireside/:hash',
	component: () => import(/* webpackChunkName: "routeFireside" */ './fireside.vue'),
	meta: {
		noFooter: true,
	},
};
