import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoinAlmost: RouteRecordRaw = {
	name: 'auth.join-almost',
	path: '/join/almost',
	component: () => import('~auth/views/auth/join-almost/RouteJoinAlmost.vue'),
	meta: {
		hideCoverImage: true,
	},
};
