import VueRouter from 'vue-router';

export const routeForumsLandingOverview: VueRouter.RouteConfig = {
	name: 'forums.landing.overview',
	path: '/forums',
	props: true,
	component: () => import('./overview'),
	children: [
		{
			path: '/community/forums',
			redirect: { name: 'forums.landing.overview' },
		},
		{
			path: '/community/forums/rules',
			redirect: { name: 'forums.landing.overview' },
		},
	],
};
