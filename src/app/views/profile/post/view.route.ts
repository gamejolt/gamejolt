import { RouteConfig } from 'vue-router';

export const routeProfilePostView: RouteConfig = {
	name: 'profile.post.view',
	path: 'post/:slug',
	redirect: '/p/:slug',
};
