import { RouteConfig } from 'vue-router';

const routeLandingHelpContent: RouteConfig = {
	name: 'landing.help',
	path: ':path*',
	component: () => import(/* webpackChunkName: "routeLandingHelp" */ './help-content'),
};

export const routeLandingHelp: RouteConfig = {
	path: '/help',
	component: () => import(/* webpackChunkName: "routeLandingHelp" */ './help.vue'),
	children: [routeLandingHelpContent],
};
