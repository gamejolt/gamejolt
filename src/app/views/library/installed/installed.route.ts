import { RouteRecordRaw } from 'vue-router';

export const routeLibraryInstalled: RouteRecordRaw = {
	name: 'library.installed',
	path: '/installed',
	component: () => import('./RouteLibraryInstalled.vue'),
};
