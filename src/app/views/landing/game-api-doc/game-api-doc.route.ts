import { RouteRecordRaw } from 'vue-router';

const routeLandingGameApiDocContent: RouteRecordRaw = {
	name: 'landing.game-api-doc',
	path: ':path*',
	component: () => import('./game-api-doc-content'),
};

export const routeLandingGameApiDoc: RouteRecordRaw = {
	path: '/game-api/doc',
	component: () => import('./game-api-doc.vue'),
	children: [routeLandingGameApiDocContent],
};
