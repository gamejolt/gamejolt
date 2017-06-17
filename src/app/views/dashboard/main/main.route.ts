import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { routeDashMainOverview } from './overview/overview.route';
import { routeDashMainPurchasesList } from './purchases/list/list.route';
import { routeDashMainPurchasesView } from './purchases/view/view.route';

export const routeDashMain: VueRouter.RouteConfig = {
	name: 'dash.main',
	path: '/dashboard',
	props: true,
	component: () => asyncComponentLoader($import('./main')),
	children: [
		routeDashMainOverview,
		routeDashMainPurchasesList,
		routeDashMainPurchasesView,
	],
};
