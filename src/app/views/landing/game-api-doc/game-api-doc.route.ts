import { RouteRecordRaw } from 'vue-router';

const routeLandingGameApiDocContent: RouteRecordRaw = {
	name: 'landing.game-api-doc',
	path: ':path*',
	component: () => import('./RouteLandingGameApiDocContent.vue'),
};

export const routeLandingGameApiDoc: RouteRecordRaw = {
	path: '/game-api/doc',
	component: () => import('./RouteLandingGameApiDoc.vue'),
	children: [routeLandingGameApiDocContent],
};
