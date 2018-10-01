import { RouteConfig } from 'vue-router';

export const routeProfilePostView: RouteConfig = {
	name: 'profile.post.view',
	path: 'post/:slug',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfilePostView" */ './view'),
};
