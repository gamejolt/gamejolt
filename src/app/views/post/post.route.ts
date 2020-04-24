import { RouteConfig } from 'vue-router';

export const routePostView: RouteConfig = {
	name: 'post.view',
	path: '/post/:slug',
	component: () => import(/* webpackChunkName: "routePostView" */ './post.vue'),
};
