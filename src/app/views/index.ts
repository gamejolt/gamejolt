import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeDiscover } from './discover/discover.route';
import { routeLanding } from './landing/landing.route';
import { routeLegal } from './legal/legal.route';
import { routeSearch } from './search/search.route';
import { routeProfile } from './profile/profile.route';
import { routeActivity } from './activity/activity.route';
import { routeLibrary } from './library/library.route';
import { routeSettings } from './settings/settings.route';
import { routeForums } from './forums/forums.route';
import { routeDash } from './dashboard/dashboard.route';
import { routeStyleguide } from './styleguide/styleguide.route';
import { routeTestAds } from './test-ads/test-ads.route';
import { routeIntent } from './intent/intent.route';

const routes = [
	routeDiscover,
	routeActivity,
	routeSearch,
	routeProfile,
	routeLibrary,
	routeSettings,
	routeLanding,
	routeForums,
	routeLegal,
	routeDash,
	routeStyleguide,
	routeTestAds,
	routeIntent,
];

export const router = initRouter(routes);
