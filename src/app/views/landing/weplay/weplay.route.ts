import { RouteConfig } from 'vue-router';

export const routeLandingWeplay: RouteConfig = {
	name: 'landing.weplay',
	path: '/stajoltia/about',
	component: () => import(/* webpackChunkName: "routeWeplay" */ './weplay.vue'),
};
