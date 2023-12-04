import { RouteRecordRaw } from 'vue-router';

export const routeDashShopProduct: RouteRecordRaw = {
	name: 'dash.shop.product',
	path: 'product/:resource(avatar\\-frame|background|sticker|sticker\\-pack)/:id(\\d+)?',
	component: () => import('./RouteDashShopProduct.vue'),
};
