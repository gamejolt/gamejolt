import { RouteRecordRaw } from 'vue-router';

// Page viewing route
export const routeLandingHelpPage: RouteRecordRaw = {
	name: 'landing.help.page',
	path: ':page(.+)',
	component: () => import('./RouteLandingHelpPage.vue'),
};

// Category navigation menu parent route
export const routeLandingHelpCategory: RouteRecordRaw = {
	name: 'landing.help.category',
	path: ':category(.+)',
	component: () => import('./RouteLandingHelpCategory.vue'),
	children: [routeLandingHelpPage],
};

// The "index" landing help page.
export const routeLandingHelpIndex: RouteRecordRaw = {
	name: 'landing.help',
	path: '',
	component: () => import('./RouteLandingHelpIndex.vue'),
};

// Search page
export const routeLandingHelpSearch: RouteRecordRaw = {
	name: 'landing.help.search',
	path: 'search',
	component: () => import('./RouteLandingHelpSearch.vue'),
};

// Base help route split between viewing a category/page and the index.
export const routeLandingHelp: RouteRecordRaw = {
	path: '/help-docs',
	component: () => import('./RouteLandingHelp.vue'),
	children: [routeLandingHelpSearch, routeLandingHelpCategory, routeLandingHelpIndex],
};

// When going to gamejolt.com/help, this redirects to gamejolt.com/help-docs.
export const routeLandingHelpIndexRedirect: RouteRecordRaw = {
	path: '/help',
	redirect: routeLandingHelp,
};

// When going to gamejolt.com/help/<page>, this fetches where to go and redirects.
export const routeLandingHelpRedirect: RouteRecordRaw = {
	name: 'landing.help.redirect',
	path: '/help/:path(.+)',
	component: () => import('./RouteLandingHelpRedirect.vue'),
};
