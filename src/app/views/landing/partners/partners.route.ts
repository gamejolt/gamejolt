import { RouteRecordRaw } from 'vue-router';

export const routeLandingPartners: RouteRecordRaw = {
	name: 'landing.partners',
	path: '/partners',
	component: () => import('./partners.vue'),
};
