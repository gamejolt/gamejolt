import { RouteConfig } from 'vue-router';
import { routeDashAccount } from './account/account.route';
import { routeDashAccountMobileNav } from './account/mobile-nav.route';
import { routeDashAnalytics } from './analytics/analytics.route';
import { routeDashGames } from './games/games.route';
import { routeDashLinking } from './linking/linking.route';

export const routeDash: RouteConfig = {
	name: 'dashboard',
	path: '/dashboard',
	component: () => import(/* webpackChunkName: "routeDash" */ './dashboard'),
	children: [
		routeDashAccount,
		routeDashAccountMobileNav,
		routeDashGames,
		routeDashAnalytics,
		routeDashLinking,
	],
};
