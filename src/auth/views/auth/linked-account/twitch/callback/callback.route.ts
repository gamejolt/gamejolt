import { RouteConfig } from 'vue-router';

export const routeAuthLinkedAccountTwitchCallback: RouteConfig = {
	name: 'auth.linked-account.twitch.callback',
	path: 'twitch/callback',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeAuthLinkedAccountTwitchCallback" */ './callback'),
};
