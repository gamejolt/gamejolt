import VueRouter from 'vue-router';

export const routeLandingAbout: VueRouter.RouteConfig = {
	name: 'landing.about',
	path: '/about',
	props: true,
	component: () => import('./about'),
};
