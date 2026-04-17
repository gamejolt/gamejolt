import { RouteRecordRaw } from 'vue-router';

export const routeLandingPartners: RouteRecordRaw = {
	name: 'landing.partners',
	path: '/partners',
	component: () => import('~app/views/landing/partners/RouteLandingPartners.vue'),
};
