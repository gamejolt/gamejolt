import { RouteRecordRaw } from 'vue-router';

export const routeAuthAuthorize: RouteRecordRaw = {
	name: 'auth.authorize',
	path: '/authorize/:userId/:code/:type',
	component: () => import('./authorize.vue'),
	meta: {
		hideCoverImage: true,
	},
};
