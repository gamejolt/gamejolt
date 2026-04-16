import { RouteRecordRaw } from 'vue-router';

export const routeNotifications: RouteRecordRaw = {
	name: 'notifications',
	path: '/notifications',
	component: () => import('~app/views/notifications/RouteNotifications.vue'),
};
