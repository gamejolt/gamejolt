import { RouteRecordRaw } from 'vue-router';

export const routeLandingMarketplace: RouteRecordRaw = {
	name: 'landing.marketplace',
	path: '/marketplace',
	component: () => import('./RouteLandingMarketplace.vue'),
};
