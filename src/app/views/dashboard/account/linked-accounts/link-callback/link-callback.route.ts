import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountLinkedAccountsLinkCallback: VueRouter.RouteConfig = {
	name: 'dash.account.linked-accounts.link-callback',
	path: 'linked-accounts/link-callback/:provider',
	props: true,
	component: () => asyncComponentLoader(import('./link-callback')),
};
