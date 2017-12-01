import { RouteConfig } from 'vue-router';

import { routeDashMain } from './main/main.route';
import { routeDashAccount } from './account/account.route';
import { routeDashAccountMobileNav } from './account/mobile-nav.route';
import { routeDashAnalytics } from './analytics/analytics.route';
import { routeDashGames } from './games/games.route';
import { routeDashWithdrawFunds } from './withdraw-funds/withdraw-funds.route';

export const routeDash: RouteConfig = {
	name: 'dashboard',
	path: '/dashboard',
	props: true,
	component: () => import(/* webpackChunkName: "routeDash" */ './dashboard'),
	children: [
		routeDashMain,
		routeDashAccount,
		routeDashAccountMobileNav,
		routeDashGames,
		routeDashAnalytics,
		routeDashWithdrawFunds,
	],
};
