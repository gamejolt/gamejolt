import { RouteConfig } from 'vue-router';

import { routeLegalPrivacy } from './privacy/privacy.route';
import { routeLegalTerms } from './terms/terms.route';
import { routeLegalCookies } from './cookies/cookies.route';
import { routeLegalAds } from './ads/ads.route';
import { routeLegalClientLicenses } from './client-licenses/client-licenses.route';

export const routeLegal: RouteConfig = {
	name: 'legal',
	path: '',
	props: true,
	component: () => import(/* webpackChunkName: "routeLegal" */ './legal'),
	children: [
		routeLegalPrivacy,
		routeLegalTerms,
		routeLegalCookies,
		routeLegalAds,
		routeLegalClientLicenses,
	],
};
