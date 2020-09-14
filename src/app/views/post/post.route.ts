import { RouteConfig } from 'vue-router';

export const routePostView: RouteConfig = {
	name: 'post',
	path: '/p/:slug',
	component: () => import(/* webpackChunkName: "routePost" */ './post.vue'),
};
