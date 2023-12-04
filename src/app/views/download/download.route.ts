import { RouteRecordRaw } from 'vue-router';

export const routeDownload: RouteRecordRaw = {
	name: 'download',
	path: '/get/:type(build|soundtrack)',
	component: () => import('./RouteDownload.vue'),
};
