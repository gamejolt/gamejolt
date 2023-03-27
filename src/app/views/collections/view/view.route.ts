import { RouteRecordRaw } from 'vue-router';

export const routeCollectionsView: RouteRecordRaw = {
	name: 'collections.view',
	path: ':collectionId',
	component: () => import('./RouteCollectionsView.vue'),
};
