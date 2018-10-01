import { RouteConfig } from 'vue-router';

export const routeProfileFollowers: RouteConfig = {
	name: 'profile.followers',
	path: 'followers',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfileFollowers" */ './followers'),
};
