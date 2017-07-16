import VueRouter from 'vue-router';

export const routeAuthLinkedAccountPoll: VueRouter.RouteConfig = {
	name: 'auth.linked-account.poll',
	path: 'linked-account/poll',
	props: true,
	component: () => import('./poll'),
};
