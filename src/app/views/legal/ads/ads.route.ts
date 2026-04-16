import { RouteRecordRaw } from 'vue-router';

export const routeLegalAds: RouteRecordRaw = {
	name: 'legal.ads',
	path: '/privacy/ads',
	component: () => import('~app/views/legal/ads/RouteLegalAds.vue'),
};
