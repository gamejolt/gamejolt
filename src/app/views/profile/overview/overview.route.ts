import { RouteRecordRaw } from 'vue-router';
import { routeProfileOverviewFeed } from './feed/feed.route';
import { routeProfileOverviewShop } from './shop/shop.route';

export const routeProfileOverview: RouteRecordRaw = {
	name: 'profile.overview',
	path: '',
	component: () => import('./RouteProfileOverview.vue'),
	children: [routeProfileOverviewShop, routeProfileOverviewFeed],
};
