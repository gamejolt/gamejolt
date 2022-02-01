import { RouteRecordRaw } from 'vue-router';

export const routeWeplay: RouteRecordRaw = {
	name: 'weplay',
	path: '/stajoltia',
	component: () => import('./weplay.vue'),
};
