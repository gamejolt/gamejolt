import VueRouter from 'vue-router';

export const routeLandingIndieaf: VueRouter.RouteConfig = {
	name: 'landing.indieaf',
	path: '/indieaf',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingIndieaf" */ './indieaf'),
};
