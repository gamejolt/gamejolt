import { RouteConfig } from 'vue-router';

export const routeLandingIndieaf: RouteConfig = {
	name: 'landing.indieaf',
	path: '/indieaf',
	component: () => import(/* webpackChunkName: "routeLandingIndieaf" */ './indieaf.vue'),
};
