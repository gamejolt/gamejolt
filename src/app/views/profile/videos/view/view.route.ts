import VueRouter from 'vue-router';

export const routeProfileVideosView: VueRouter.RouteConfig = {
	name: 'profile.videos.view',
	path: 'videos/:postHash',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfileVideosView" */ './view'),
};
