import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountMixerCallback: RouteConfig = {
	name: 'auth.linked-account.mixer.callback',
	path: 'mixer/callback',
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountMixerCallback" */ './callback'),
};
