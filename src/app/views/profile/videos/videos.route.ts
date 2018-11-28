import { RouteConfig } from 'vue-router';

export const routeProfileVideos: RouteConfig = {
	name: 'profile.videos',
	path: 'videos',
	component: () => import(/* webpackChunkName: "routeProfileVideos" */ './videos'),
};
