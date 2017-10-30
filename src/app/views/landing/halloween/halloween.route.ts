import VueRouter from 'vue-router';

export const routeLandingHalloween: VueRouter.RouteConfig = {
	name: 'landing.halloween',
	path: '/halloween',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingHalloween" */ './halloween'),
};
