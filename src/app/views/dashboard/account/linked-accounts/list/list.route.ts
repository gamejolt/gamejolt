import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountLinkedAccountsList: VueRouter.RouteConfig = {
	name: 'dash.account.linked-accounts.list',
	path: 'linked-accounts',
	props: true,
	component: () => asyncComponentLoader(import('./list')),
};
