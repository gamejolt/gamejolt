import { RouteConfig } from 'vue-router';
import { routeAuthLinkedAccountFacebookCallback } from './facebook/callback/callback.route';
import { routeAuthLinkedAccountGoogleCallback } from './google/callback/callback.route';
import { routeAuthLinkedAccountPoll } from './poll/poll.route';
import { routeAuthLinkedAccountTwitchCallback } from './twitch/callback/callback.route';
import { routeAuthLinkedAccountTwitterCallback } from './twitter/callback/callback.route';

export const routeAuthLinkedAccount: RouteConfig = {
	name: 'auth.linked-account',
	path: 'auth',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthLinkedAccount" */ './linked-account'),
	meta: {
		hideCoverImage: true,
	},
	children: [
		routeAuthLinkedAccountPoll,
		routeAuthLinkedAccountTwitterCallback,
		routeAuthLinkedAccountFacebookCallback,
		routeAuthLinkedAccountGoogleCallback,
		routeAuthLinkedAccountTwitchCallback,
	],
};
