import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountLinkedAccountsLinking: VueRouter.RouteConfig = {
	name: 'dash.account.linked-accounts.linking',
	path: 'linked-accounts/linking',
	props: true,
	component: () => asyncComponentLoader(import('./linking')),
};
