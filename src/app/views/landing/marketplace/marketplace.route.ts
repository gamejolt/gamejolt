import { RouteConfig } from 'vue-router';

export const routeLandingMarketplace: RouteConfig = {
	name: 'landing.marketplace',
	path: '/marketplace',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingMarketplace" */ './marketplace'),
};
