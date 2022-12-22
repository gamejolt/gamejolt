import { RouteRecordRaw } from 'vue-router';
import { routeDashAccount } from './account/account.route';
import { routeDashAccountMobileNav } from './account/mobile-nav.route';
import { routeDashAnalytics } from './analytics/analytics.route';
import { routeDashCommunities } from './communities/communities.route';
import { routeDashCreator } from './creator/creator.route';
import { routeDashGames } from './games/games.route';
import { routeDashLinking } from './linking/linking.route';
import { routeDashReferrals } from './referrals/referrals.route';
import { routeDashStickers } from './stickers/stickers.route';
import { routeDashSupporters } from './supporters/supporters.route';

export const routeDash: RouteRecordRaw = {
	name: 'dashboard',
	path: '/dashboard',
	component: () => import('./RouteDashboard.vue'),
	children: [
		routeDashAccount,
		routeDashAccountMobileNav,
		routeDashCreator,
		routeDashGames,
		routeDashCommunities,
		routeDashAnalytics,
		routeDashLinking,
		routeDashStickers,
		routeDashSupporters,
		routeDashReferrals,
	],
};
