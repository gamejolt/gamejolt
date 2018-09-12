import { RouteConfig } from 'vue-router';

export const routeLegalClientLicenses: RouteConfig = {
	name: 'legal.client-licenses',
	path: '/client-licenses',
	props: true,
	component: () => import(/* webpackChunkName: "routeLegalClientLicenses" */ './client-licenses'),
};
