import { RouteRecordRaw } from 'vue-router';

export const routeProfilePostView: RouteRecordRaw = {
	name: 'profile.post.view',
	path: 'post/:slug',
	redirect: '/p/:slug',
};
