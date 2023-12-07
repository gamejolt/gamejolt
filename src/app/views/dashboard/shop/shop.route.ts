import { RouteRecordRaw } from 'vue-router';
import { routeDashShopOverview } from './overview/overview.route';
import { routeDashShopProduct } from './product/product.route';

export const routeDashShop: RouteRecordRaw = {
	name: 'dash.shop',
	path: 'shop',
	component: () => import('./RouteDashShop.vue'),
	children: [routeDashShopOverview, routeDashShopProduct],
};
