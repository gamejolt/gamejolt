import { RouteRecordRaw } from 'vue-router';

export const routeDashShopProduct: RouteRecordRaw = {
	name: 'dash.shop.product',
	path: '/dashboard/shop/product/:typename/:id?',
	component: () => import('./RouteDashShopProduct.vue'),
};
