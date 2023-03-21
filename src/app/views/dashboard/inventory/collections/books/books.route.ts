import { RouteRecordRaw } from 'vue-router';

export const routeDashInventoryCollectionsBooks: RouteRecordRaw = {
	name: 'dash.inventory.collections.books',
	path: '',
	component: () => import('./RouteDashInventoryCollectionsBooks.vue'),
};
