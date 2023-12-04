import { RouteRecordRaw } from 'vue-router';

export const routeProfileOverviewShop: RouteRecordRaw = {
	name: 'profile.shop',
	path: '/@:username/shop',
	component: () => import('./RouteProfileOverviewShop.vue'),
};
