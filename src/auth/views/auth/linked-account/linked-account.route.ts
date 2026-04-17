import { RouteRecordRaw } from 'vue-router';

import { routeAuthLinkedAccountFacebookCallback } from '~auth/views/auth/linked-account/facebook/callback/callback.route';
import { routeAuthLinkedAccountGoogleCallback } from '~auth/views/auth/linked-account/google/callback/callback.route';
import { routeAuthLinkedAccountPoll } from '~auth/views/auth/linked-account/poll/poll.route';
import { routeAuthLinkedAccountTwitchCallback } from '~auth/views/auth/linked-account/twitch/callback/callback.route';

export const routeAuthLinkedAccount: RouteRecordRaw = {
	name: 'auth.linked-account',
	path: '/auth',
	component: () => import('~auth/views/auth/linked-account/RouteAuthLinkedAccount.vue'),
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
