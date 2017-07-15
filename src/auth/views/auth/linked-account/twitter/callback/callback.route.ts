import VueRouter from 'vue-router';

export const routeAuthLinkedAccountTwitterCallback: VueRouter.RouteConfig = {
	name: 'auth.linked-account.twitter.callback',
	path: 'twitter/callback',
	props: true,
	component: () => import('./callback'),
};
