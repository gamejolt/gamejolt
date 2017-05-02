import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { routeAuthLinkedAccountTwitterCallback } from './twitter/callback/callback.route';
import { routeAuthLinkedAccountTwitterFinalize } from './twitter/finalize/finalize.route';
import { routeAuthLinkedAccountPoll } from './poll/poll.route';
import { routeAuthLinkedAccountFacebookCallback } from './facebook/callback/callback.route';
import { routeAuthLinkedAccountGoogleCallback } from './google/callback/callback.route';
import { routeAuthLinkedAccountTwitchCallback } from './twitch/callback/callback.route';

export const routeAuthLinkedAccount: VueRouter.RouteConfig = {
	name: 'auth.linked-account',
	path: 'auth',
	props: true,
	component: () => asyncComponentLoader( $import( './linked-account' ) ),
	meta: {
		hideCoverImage: true,
	},
	children: [
		routeAuthLinkedAccountPoll,
		routeAuthLinkedAccountTwitterCallback,
		routeAuthLinkedAccountTwitterFinalize,
		routeAuthLinkedAccountFacebookCallback,
		routeAuthLinkedAccountGoogleCallback,
		routeAuthLinkedAccountTwitchCallback,
	],
};
