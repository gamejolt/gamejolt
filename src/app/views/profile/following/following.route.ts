import { RouteConfig } from 'vue-router';

export const routeProfileFollowing: RouteConfig = {
	name: 'profile.following',
	path: 'following',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfileFollowing" */ './following'),
};
