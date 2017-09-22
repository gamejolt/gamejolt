import VueRouter from 'vue-router';

export const routeProfileVideosList: VueRouter.RouteConfig = {
	name: 'profile.videos.list',
	path: 'videos',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfile" */ './list'),
};
