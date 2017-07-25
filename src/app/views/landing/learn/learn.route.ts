import VueRouter from 'vue-router';

export const routeLandingLearn: VueRouter.RouteConfig = {
	name: 'landing.learn',
	path: '/learn',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingLearn" */ './learn'),
};
