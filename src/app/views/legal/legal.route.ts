import { RouteRecordRaw } from 'vue-router';
import { routeLegalAds } from './ads/ads.route';
import { routeLegalCookies } from './cookies/cookies.route';
import { routeLegalDeletion } from './deletion/deletion.route';
import { routeLegalPrivacy } from './privacy/privacy.route';
import { routeLegalSafety } from './safety/safety.route';
import { routeLegalTerms } from './terms/terms.route';

export const routeLegal: RouteRecordRaw = {
	// TODO(vue3): better solution
	path: '/legal',
	component: () => import('./RouteLegal.vue'),
	children: [
		routeLegalPrivacy,
		routeLegalSafety,
		routeLegalTerms,
		routeLegalCookies,
		routeLegalAds,
		routeLegalDeletion,
	],
};
