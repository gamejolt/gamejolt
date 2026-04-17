import { RouteRecordRaw } from 'vue-router';

export const routeForumsLandingOverview: RouteRecordRaw = {
	name: 'forums.landing.overview',
	path: '',
	component: () => import('~app/views/forums/landing/overview/RouteForumsLandingOverview.vue'),
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
