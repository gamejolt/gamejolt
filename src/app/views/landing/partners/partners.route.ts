import { RouteConfig } from 'vue-router';

export const routeLandingPartners: RouteConfig = {
	name: 'landing.partners',
	path: '/partners',
	component: () => import(/* webpackChunkName: "routeLandingPartners" */ './partners.vue'),
};
