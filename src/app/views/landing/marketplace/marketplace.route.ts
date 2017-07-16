import VueRouter from 'vue-router';

export const routeLandingMarketplace: VueRouter.RouteConfig = {
	name: 'landing.marketplace',
	path: '/marketplace',
	props: true,
	component: () => import('./marketplace'),
};
