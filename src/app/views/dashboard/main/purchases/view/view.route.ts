import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashMainPurchasesView: VueRouter.RouteConfig = {
	name: 'dash.main.purchases.view',
	path: 'purchases/view/:id',
	props: true,
	component: () => asyncComponentLoader(import('./view')),
};
