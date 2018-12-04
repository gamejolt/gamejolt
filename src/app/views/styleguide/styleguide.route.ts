import { RouteConfig } from 'vue-router';

export const routeStyleguide: RouteConfig = {
	name: 'styleguide',
	path: '/styleguide',
	component: () => import(/* webpackChunkName: "routeStyleguide" */ './styleguide'),
};
