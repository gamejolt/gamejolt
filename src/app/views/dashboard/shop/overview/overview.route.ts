import { RouteRecordRaw } from 'vue-router';

export const routeDashShopOverview: RouteRecordRaw = {
	name: 'dash.shop.overview',
	path: '/dashboard/shop',
	component: () => import('./RouteDashShopOverview.vue'),
};
