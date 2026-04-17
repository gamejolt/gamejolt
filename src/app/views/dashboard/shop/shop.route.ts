import { RouteRecordRaw } from 'vue-router';

import { routeDashShopOverview } from '~app/views/dashboard/shop/overview/overview.route';
import { routeDashShopProduct } from '~app/views/dashboard/shop/product/product.route';

export const routeDashShop: RouteRecordRaw = {
	name: 'dash.shop',
	path: 'shop',
	component: () => import('~app/views/dashboard/shop/RouteDashShop.vue'),
	children: [routeDashShopOverview, routeDashShopProduct],
};
