import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoin: RouteRecordRaw = {
	name: 'auth.join',
	path: '/join',
	component: () => import('~auth/views/auth/join/RouteAuthJoin.vue'),
};
