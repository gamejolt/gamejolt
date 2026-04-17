import { RouteRecordRaw } from 'vue-router';

import { routeDashAccount } from '~app/views/dashboard/account/account.route';
import { routeDashAccountMobileNav } from '~app/views/dashboard/account/mobile-nav.route';
import { routeDashAnalytics } from '~app/views/dashboard/analytics/analytics.route';
import { routeDashCommunities } from '~app/views/dashboard/communities/communities.route';
import { routeDashCreator } from '~app/views/dashboard/creator/creator.route';
import { routeDashGames } from '~app/views/dashboard/games/games.route';
import { routeDashLinking } from '~app/views/dashboard/linking/linking.route';
import { routeDashShop } from '~app/views/dashboard/shop/shop.route';
import { routeDashSupporters } from '~app/views/dashboard/supporters/supporters.route';

export const routeDash: RouteRecordRaw = {
	path: '/dashboard',
	component: () => import('~app/views/dashboard/RouteDashboard.vue'),
	children: [
		routeDashAccount,
		routeDashAccountMobileNav,
		routeDashCreator,
		routeDashGames,
		routeDashCommunities,
		routeDashAnalytics,
		routeDashLinking,
		routeDashSupporters,
		routeDashShop,
	],
};
