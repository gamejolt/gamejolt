import { RouteRecordRaw } from 'vue-router';

export const routeFiresideRedirect: RouteRecordRaw = {
	name: 'fireside.redirect',
	path: '/fireside/@:username',
	component: () => import('./RouteFiresideRedirect.vue'),
};
