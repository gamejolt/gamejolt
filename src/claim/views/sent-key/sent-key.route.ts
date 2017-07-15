import VueRouter from 'vue-router';

export const routeSentKey: VueRouter.RouteConfig = {
	name: 'sent-key',
	path: '/claim/sent',
	props: true,
	component: () => import('./sent-key'),
};
