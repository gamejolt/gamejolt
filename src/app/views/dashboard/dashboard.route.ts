import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeDashMain } from './main/main.route';
import { routeDashAccount } from './account/account.route';
import { routeDashAccountMobileNav } from './account/mobile-nav.route';
import { routeDashAnalytics } from './analytics/analytics.route';
import { routeDashGames } from './games/games.route';

export const routeDash: VueRouter.RouteConfig = {
	name: 'dashboard',
	path: '/dashboard',
	props: true,
	component: () => asyncComponentLoader(import('./dashboard')),
	children: [
		routeDashMain,
		routeDashAccount,
		routeDashAccountMobileNav,
		routeDashGames,
		routeDashAnalytics,
	],
};
