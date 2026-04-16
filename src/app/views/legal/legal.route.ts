import { RouteRecordRaw } from 'vue-router';

import { routeLegalAds } from '~app/views/legal/ads/ads.route';
import { routeLegalCookies } from '~app/views/legal/cookies/cookies.route';
import { routeLegalDeletion } from '~app/views/legal/deletion/deletion.route';
import { routeLegalPrivacy } from '~app/views/legal/privacy/privacy.route';
import { routeLegalSafety } from '~app/views/legal/safety/safety.route';
import { routeLegalTerms } from '~app/views/legal/terms/terms.route';

export const routeLegal: RouteRecordRaw = {
	// TODO(vue3): better solution
	path: '/legal',
	component: () => import('~app/views/legal/RouteLegal.vue'),
	children: [
		routeLegalPrivacy,
		routeLegalSafety,
		routeLegalTerms,
		routeLegalCookies,
		routeLegalAds,
		routeLegalDeletion,
	],
};
