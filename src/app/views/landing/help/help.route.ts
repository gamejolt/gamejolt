import { RouteRecordRaw } from 'vue-router';

const routeLandingHelpContent: RouteRecordRaw = {
	name: 'landing.help',
	path: ':path(.*)*',
	component: () => import(/* webpackChunkName: "routeLandingHelp" */ './help-content'),
};

export const routeLandingHelp: RouteRecordRaw = {
	path: '/help',
	component: () => import(/* webpackChunkName: "routeLandingHelp" */ './help.vue'),
	children: [routeLandingHelpContent],
};
