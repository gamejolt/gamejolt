import { RouteConfig } from 'vue-router';

export const routeLegalPrivacy: RouteConfig = {
	name: 'legal.privacy',
	path: '/privacy',
	props: true,
	component: () => import(/* webpackChunkName: "routeLegalPrivacy" */ './privacy'),
};
