import { RouteRecordRaw } from 'vue-router';
import { routeDashInventoryCollectionsBooks } from './books/books.route';

export const routeDashInventoryCollections: RouteRecordRaw = {
	path: 'collections',
	component: () => import('./RouteDashInventoryCollections.vue'),
	children: [routeDashInventoryCollectionsBooks],
};
