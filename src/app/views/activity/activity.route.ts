import VueRouter from 'vue-router';

export const routeActivity: VueRouter.RouteConfig = {
	name: 'activity',
	path: '/:tab(activity|notifications)',
	props: true,
	component: () => import('./activity'),
};
