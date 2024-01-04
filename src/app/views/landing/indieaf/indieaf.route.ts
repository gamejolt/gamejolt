import { RouteRecordRaw } from 'vue-router';

export const routeLandingIndieaf: RouteRecordRaw = {
	name: 'landing.indieaf',
	path: '/indieaf',
	component: () => import('./RouteLandingIndieaf.vue'),
};
