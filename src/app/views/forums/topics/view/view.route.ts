import { RouteConfig } from 'vue-router';

export const routeForumsTopicsView: RouteConfig = {
	name: 'forums.topics.view',
	path: '/f/:slug/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeForumsTopicsView" */ './view.vue'),
};
