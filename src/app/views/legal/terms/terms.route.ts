import { RouteConfig } from 'vue-router';

export const routeLegalTerms: RouteConfig = {
	name: 'legal.terms',
	path: '/terms',
	props: true,
	component: () => import(/* webpackChunkName: "routeLegalTerms" */ './terms'),
};
