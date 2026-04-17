import { RouteRecordRaw } from 'vue-router';

const routeLandingGameApiDocContent: RouteRecordRaw = {
	name: 'landing.game-api-doc',
	path: ':path*',
	component: () => import('~app/views/landing/game-api-doc/RouteLandingGameApiDocContent.vue'),
};

export const routeLandingGameApiDoc: RouteRecordRaw = {
	path: '/game-api/doc',
	component: () => import('~app/views/landing/game-api-doc/RouteLandingGameApiDoc.vue'),
	children: [routeLandingGameApiDocContent],
};
