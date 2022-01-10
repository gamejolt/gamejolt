import { RouteRecordRaw } from 'vue-router';

const routeLandingHelpContent: RouteRecordRaw = {
	name: 'landing.help',
	path: ':path(.*)*',
	component: () => import('./help-content'),
};

export const routeLandingHelp: RouteRecordRaw = {
	path: '/help',
	component: () => import('./help.vue'),
	children: [routeLandingHelpContent],
};
