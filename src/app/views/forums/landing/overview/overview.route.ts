import { RouteConfig } from 'vue-router';

export const routeForumsLandingOverview: RouteConfig = {
	name: 'forums.landing.overview',
	path: '/forums',
	component: () => import(/* webpackChunkName: "routeForumsLanding" */ './overview'),
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
