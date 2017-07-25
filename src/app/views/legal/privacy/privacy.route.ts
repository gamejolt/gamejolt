import VueRouter from 'vue-router';

export const routeLegalPrivacy: VueRouter.RouteConfig = {
	name: 'legal.privacy',
	path: '/privacy',
	props: true,
	component: () => import(/* webpackChunkName: "routeLegalPrivacy" */ './privacy'),
};
