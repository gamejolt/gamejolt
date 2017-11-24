import { RouteConfig } from 'vue-router';

export const routeStyleguide: RouteConfig = {
	name: 'styleguide',
	path: '/styleguide',
	props: true,
	component: () => import(/* webpackChunkName: "routeStyleguide" */ './styleguide'),
};
