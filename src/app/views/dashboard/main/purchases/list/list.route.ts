import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashMainPurchasesList: VueRouter.RouteConfig = {
	name: 'dash.main.purchases.list',
	path: 'purchases',
	props: true,
	component: () => asyncComponentLoader(import('./list')),
};
