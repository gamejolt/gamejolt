import { RouteRecordRaw } from 'vue-router';

export const routeLandingGameApi: RouteRecordRaw = {
	name: 'landing.game-api',
	path: '/game-api',
	component: () => import('./RouteLandingGameApi.vue'),
};
