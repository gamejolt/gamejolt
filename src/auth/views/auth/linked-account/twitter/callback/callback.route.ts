import { RouteRecordRaw } from 'vue-router';

export const routeAuthLinkedAccountTwitterCallback: RouteRecordRaw = {
	name: 'auth.linked-account.twitter.callback',
	path: 'twitter/callback',
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountTwitterCallback" */ './callback'),
};
