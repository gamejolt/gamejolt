import { RouteConfig } from 'vue-router';

export const routeForumsTopicsView: RouteConfig = {
	name: 'forums.topics.view',
	path: '/f/:slug/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeForumsTopicsView" */ './view'),
};
