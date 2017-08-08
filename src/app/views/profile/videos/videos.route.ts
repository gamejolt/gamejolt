import VueRouter from 'vue-router';

export const routeProfileVideos: VueRouter.RouteConfig = {
	name: 'profile.videos',
	path: 'videos',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfile" */ './videos'),
};
