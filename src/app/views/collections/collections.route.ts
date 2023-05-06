import { RouteRecordRaw } from 'vue-router';
import { routeCollectionsView } from './view/view.route';

export const routeCollections: RouteRecordRaw = {
	name: 'collections',
	path: '/collections/:username(me|@.+)',
	component: () => import('./RouteCollections.vue'),
	children: [routeCollectionsView],
};
