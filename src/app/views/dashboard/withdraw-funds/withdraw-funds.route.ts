import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeDashWithdrawFunds: VueRouter.RouteConfig = {
	name: 'dash.withdraw-funds',
	path: 'withdraw-funds',
	alias: 'developer/withdraw-funds',
	props: true,
	component: () => asyncComponentLoader(import('./withdraw-funds')),
};
