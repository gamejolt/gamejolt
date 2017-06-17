import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountMobileNav: VueRouter.RouteConfig = {
	name: 'dash.account-mobile-nav',
	path: 'account/nav',
	props: true,
	component: () => asyncComponentLoader($import('./mobile-nav')),
};
