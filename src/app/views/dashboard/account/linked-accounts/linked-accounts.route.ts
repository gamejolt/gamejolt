import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountLinkedAccounts: VueRouter.RouteConfig = {
	name: 'dash.account.linked-accounts',
	path: 'linked-accounts',
	props: true,
	component: () => asyncComponentLoader(import('./linked-accounts')),
};
