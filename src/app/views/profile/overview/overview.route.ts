import VueRouter from 'vue-router';

export const routeProfileOverview: VueRouter.RouteConfig = {
	name: 'profile.overview',
	path: '/@:username',
	props: true,
	component: () => import('./overview'),
};
