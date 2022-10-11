import { RouteRecordRaw } from 'vue-router';
import { routeDashAccount } from './account/account.route';
import { routeDashAccountMobileNav } from './account/mobile-nav.route';
import { routeDashAnalytics } from './analytics/analytics.route';
import { routeDashCommunities } from './communities/communities.route';
import { routeDashGames } from './games/games.route';
import { routeDashLinking } from './linking/linking.route';
import { routeDashStickers } from './stickers/stickers.route';

export const routeDash: RouteRecordRaw = {
	name: 'dashboard',
	path: '/dashboard',
	component: () => import('./RouteDashboard.vue'),
	children: [
		routeDashAccount,
		routeDashAccountMobileNav,
		routeDashGames,
		routeDashCommunities,
		routeDashAnalytics,
		routeDashLinking,
		routeDashStickers,
	],
};
