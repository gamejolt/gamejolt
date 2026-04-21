import { RouteRecordRaw } from 'vue-router';

// Page viewing route
export const routeLandingHelpPage: RouteRecordRaw = {
	name: 'landing.help.page',
	path: ':page(.+)',
	component: () => import('~app/views/landing/help/RouteLandingHelpPage.vue'),
};

// Category navigation menu parent route
export const routeLandingHelpCategory: RouteRecordRaw = {
	name: 'landing.help.category',
	path: ':category(.+)',
	component: () => import('~app/views/landing/help/RouteLandingHelpCategory.vue'),
	children: [routeLandingHelpPage],
};

// The "index" landing help page.
export const routeLandingHelpIndex: RouteRecordRaw = {
	name: 'landing.help',
	path: '',
	component: () => import('~app/views/landing/help/RouteLandingHelpIndex.vue'),
};

// Base help route split between viewing a category/page and the index.
export const routeLandingHelp: RouteRecordRaw = {
	path: '/help-docs',
	component: () => import('~app/views/landing/help/RouteLandingHelp.vue'),
	children: [routeLandingHelpCategory, routeLandingHelpIndex],
};

// When going to gamejolt.com/help, this redirects to gamejolt.com/help-docs.
export const routeLandingHelpIndexRedirect: RouteRecordRaw = {
	path: '/help',
	redirect: routeLandingHelpIndex,
};

// When going to gamejolt.com/help/<page>, this fetches where to go and redirects.
export const routeLandingHelpRedirect: RouteRecordRaw = {
	name: 'landing.help.redirect',
	path: '/help/:path(.+)',
	component: () => import('~app/views/landing/help/RouteLandingHelpRedirect.vue'),
};

export function routeUrlLandingHelpRedirect({ path }: { path: string }) {
	return `/help/${path}`;
}
