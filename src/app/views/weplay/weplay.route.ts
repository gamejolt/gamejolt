import { RouteRecordRaw } from 'vue-router';

export const routeWeplay: RouteRecordRaw = {
	name: 'weplay',
	path: '/stajoltia',
	component: () => import('~app/views/weplay/RouteWeplay.vue'),
};
