import { RouteConfig } from 'vue-router';

export const routeProfileVideos: RouteConfig = {
	name: 'profile.videos',
	path: 'videos',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfileVideos" */ './videos'),
};
