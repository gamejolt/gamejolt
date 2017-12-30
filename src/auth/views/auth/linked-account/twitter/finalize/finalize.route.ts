import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountTwitterFinalize: RouteConfig = {
	name: 'auth.linked-account.twitter.finalize',
	path: 'twitter/finalize/:state',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountTwitterFinalize" */ './finalize'),
};
