import { RouteConfig } from 'vue-router';

export const routeLegalDeletion: RouteConfig = {
	name: 'legal.deletion',
	path: '/account-deletion',
	component: () => import(/* webpackChunkName: "routeLegalDeletion" */ './deletion'),
};
