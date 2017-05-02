import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeAuthLinkedAccountGoogleCallback: VueRouter.RouteConfig = {
	name: 'auth.linked-account.google.callback',
	path: 'google/callback',
	props: true,
	component: () => asyncComponentLoader( $import( './callback' ) ),
};
