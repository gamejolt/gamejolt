import { RouteConfig } from 'vue-router';

export const routeLandingMarketplace: RouteConfig = {
	name: 'landing.marketplace',
	path: '/marketplace',
	component: () => import(/* webpackChunkName: "routeLandingMarketplace" */ './marketplace.vue'),
};
