import { RouteRecordRaw } from 'vue-router';

export const routeLegalTerms: RouteRecordRaw = {
	name: 'legal.terms',
	path: '/terms',
	component: () => import(/* webpackChunkName: "routeLegalTerms" */ './terms'),
};
