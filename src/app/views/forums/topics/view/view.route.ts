import { RouteRecordRaw } from 'vue-router';

export const routeForumsTopicsView: RouteRecordRaw = {
	name: 'forums.topics.view',
	path: '/f/:slug/:id(\\d+)',
	component: () => import('./RouteForumsTopicsView.vue'),
};
