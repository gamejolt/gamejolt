import { RouteConfig } from 'vue-router';

export const routeLandingIndieaf: RouteConfig = {
	name: 'landing.indieaf',
	path: '/indieaf',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingIndieaf" */ './indieaf'),
};
