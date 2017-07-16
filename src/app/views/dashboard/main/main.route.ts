import VueRouter from 'vue-router';

import { routeDashMainOverview } from './overview/overview.route';
import { routeDashMainPurchasesList } from './purchases/list/list.route';
import { routeDashMainPurchasesView } from './purchases/view/view.route';
import { routeDashMainSite } from './site/site.route';

export const routeDashMain: VueRouter.RouteConfig = {
	name: 'dash.main',
	path: '/dashboard',
	props: true,
	component: () => import('./main'),
	children: [
		routeDashMainOverview,
		routeDashMainPurchasesList,
		routeDashMainPurchasesView,
		routeDashMainSite,
	],
};
