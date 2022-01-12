import { RouteRecordRaw } from 'vue-router';

export const routeSearchUsers: RouteRecordRaw = {
	name: 'search.users',
	path: 'users',
	component: () => import('./users.vue'),
};
