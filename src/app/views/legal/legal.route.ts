import { RouteConfig } from 'vue-router';
import { routeLegalAds } from './ads/ads.route';
import { routeLegalCookies } from './cookies/cookies.route';
import { routeLegalDeletion } from './deletion/deletion.route';
import { routeLegalPrivacy } from './privacy/privacy.route';
import { routeLegalTerms } from './terms/terms.route';

export const routeLegal: RouteConfig = {
	name: 'legal',
	path: '',
	component: () => import(/* webpackChunkName: "routeLegal" */ './legal.vue'),
	children: [
		routeLegalPrivacy,
		routeLegalTerms,
		routeLegalCookies,
		routeLegalAds,
		routeLegalDeletion,
	],
};
