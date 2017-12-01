import { RouteConfig } from 'vue-router';

export const routeActivity: RouteConfig = {
	name: 'activity',
	path: '/:tab(activity|notifications)',
	props: true,
	component: () => import(/* webpackChunkName: "routeActivity" */ './activity'),
};
