import { RouteRecordRaw } from 'vue-router';
import { routeAuthLinkedAccountFacebookCallback } from './facebook/callback/callback.route';
import { routeAuthLinkedAccountGoogleCallback } from './google/callback/callback.route';
import { routeAuthLinkedAccountPoll } from './poll/poll.route';
import { routeAuthLinkedAccountTwitchCallback } from './twitch/callback/callback.route';

export const routeAuthLinkedAccount: RouteRecordRaw = {
	name: 'auth.linked-account',
	path: '/auth',
	component: () => import('./linked-account'),
	meta: {
		hideCoverImage: true,
	},
	children: [
		routeAuthLinkedAccountPoll,
		routeAuthLinkedAccountFacebookCallback,
		routeAuthLinkedAccountGoogleCallback,
		routeAuthLinkedAccountTwitchCallback,
	],
};
