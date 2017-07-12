import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountFinancials: VueRouter.RouteConfig = {
	name: 'dash.account.financials',
	path: 'financials',
	props: true,
	component: () => asyncComponentLoader(import('./financials')),
};
