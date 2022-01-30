import { RouteRecordRaw } from 'vue-router';

export const routeLibraryOverview: RouteRecordRaw = {
	name: 'library.overview',
	path: '',
	component: () => import('./overview.vue'),
};
