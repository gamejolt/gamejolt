import VueRouter from 'vue-router';

export const routeLandingPartners: VueRouter.RouteConfig = {
	name: 'landing.partners',
	path: '/partners',
	props: true,
	component: () => import('./partners'),
};
