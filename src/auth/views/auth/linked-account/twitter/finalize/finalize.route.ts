import VueRouter from 'vue-router';

export const routeAuthLinkedAccountTwitterFinalize: VueRouter.RouteConfig = {
	name: 'auth.linked-account.twitter.finalize',
	path: 'twitter/finalize/:state',
	props: true,
	component: () => import('./finalize'),
};
