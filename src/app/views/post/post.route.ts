import { RouteRecordRaw } from 'vue-router';

export const routePost: RouteRecordRaw = {
	name: 'post',
	path: '/p/:slug',
	component: () => import('~app/views/post/RoutePost.vue'),
};
