import { RouteRecordRaw } from 'vue-router';

export const routeLibraryInstalled: RouteRecordRaw = {
	name: 'library.installed',
	path: '/installed',
	component: () => import('~app/views/library/installed/RouteLibraryInstalled.vue'),
};
