import { RouteConfig } from 'vue-router';

export const routePost: RouteConfig = {
	name: 'post',
	path: '/p/:slug',
	component: () => import(/* webpackChunkName: "routePost" */ './post.vue'),
};
