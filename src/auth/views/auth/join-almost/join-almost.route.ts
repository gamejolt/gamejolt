import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoinAlmost: RouteRecordRaw = {
	name: 'auth.join-almost',
	path: '/join/almost',
	component: () => import('./join-almost.vue'),
	meta: {
		hideCoverImage: true,
	},
};
