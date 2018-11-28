import { RouteConfig } from 'vue-router';

export const routeLegalTerms: RouteConfig = {
	name: 'legal.terms',
	path: '/terms',
	component: () => import(/* webpackChunkName: "routeLegalTerms" */ './terms'),
};
