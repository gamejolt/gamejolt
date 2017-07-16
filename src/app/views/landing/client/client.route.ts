import VueRouter from 'vue-router';

export const routeLandingClient: VueRouter.RouteConfig = {
	name: 'landing.client',
	path: '/client',
	props: true,
	component: () => import('./client'),
};
