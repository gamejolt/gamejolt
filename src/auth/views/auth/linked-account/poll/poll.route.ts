import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountPoll: RouteConfig = {
	name: 'auth.linked-account.poll',
	path: 'linked-account/poll/:token',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthLinkedAccountPoll" */ './poll'),
};
