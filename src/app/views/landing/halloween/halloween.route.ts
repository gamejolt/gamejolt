import { RouteConfig } from 'vue-router';

export const routeLandingHalloween: RouteConfig = {
	name: 'landing.halloween',
	path: '/halloween',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingHalloween" */ './halloween.vue'),
};
