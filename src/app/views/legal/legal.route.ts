import { RouteConfig } from 'vue-router';
import { routeLegalAds } from './ads/ads.route';
import { routeLegalCookies } from './cookies/cookies.route';
import { routeLegalPrivacy } from './privacy/privacy.route';
import { routeLegalTerms } from './terms/terms.route';

export const routeLegal: RouteConfig = {
	name: 'legal',
	path: '',
	component: () => import(/* webpackChunkName: "routeLegal" */ './legal'),
	children: [routeLegalPrivacy, routeLegalTerms, routeLegalCookies, routeLegalAds],
};
