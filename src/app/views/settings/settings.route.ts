import VueRouter from 'vue-router';

export const routeSettings: VueRouter.RouteConfig = {
	name: 'settings',
	path: '/settings',
	props: true,
	component: () => import('./settings'),
	meta: {
		availableOffline: true,
	},
};
