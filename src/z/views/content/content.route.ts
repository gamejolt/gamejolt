import { RouteRecordRaw } from 'vue-router';

export const routeContent: RouteRecordRaw = {
	name: 'content',
	path: '/z/content/:resource/:resourceId',
	component: () => import('./content.vue'),
};
