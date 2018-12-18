import { RouteConfig } from 'vue-router';

export const routeLegalAds: RouteConfig = {
	name: 'legal.ads',
	path: '/privacy/ads',
	component: () => import(/* webpackChunkName: "routeLegalAds" */ './ads'),
};
