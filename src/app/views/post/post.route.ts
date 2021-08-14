import { RouteRecordRaw } from 'vue-router';

export const routePost: RouteRecordRaw = {
	name: 'post',
	path: '/p/:slug',
	component: () => import(/* webpackChunkName: "routePost" */ './post.vue'),
};
