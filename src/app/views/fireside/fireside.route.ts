import { RouteRecordRaw } from 'vue-router';

export const routeFireside: RouteRecordRaw = {
	name: 'fireside',
	path: '/fireside/:hash',
	component: () => import('./RouteFireside.vue'),
	meta: {
		noFooter: true,
	},
};
