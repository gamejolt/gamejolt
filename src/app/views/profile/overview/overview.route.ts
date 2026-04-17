import { RouteRecordRaw } from 'vue-router';

import { routeProfileOverviewFeed } from '~app/views/profile/overview/feed/feed.route';
import { routeProfileOverviewShop } from '~app/views/profile/overview/shop/shop.route';

export const routeProfileOverview: RouteRecordRaw = {
	path: '',
	component: () => import('~app/views/profile/overview/RouteProfileOverview.vue'),
	children: [routeProfileOverviewShop, routeProfileOverviewFeed],
};
