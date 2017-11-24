import { RouteConfig } from 'vue-router';

export const routeLandingAbout: RouteConfig = {
	name: 'landing.about',
	path: '/about',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingAbout" */ './about'),
};
