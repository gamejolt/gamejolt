import { RouteConfig } from 'vue-router';

export const routeProfileVideosList: RouteConfig = {
	name: 'profile.videos.list',
	path: 'videos',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfile" */ './list'),
};
