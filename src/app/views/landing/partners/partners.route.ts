import { RouteConfig } from 'vue-router';

export const routeLandingPartners: RouteConfig = {
	name: 'landing.partners',
	path: '/partners',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingPartners" */ './partners'),
};
