import { initRouter } from 'game-jolt-frontend-lib/utils/router';
import { store } from '../store/index';
import { routeCommunitiesView } from './communities/view/view.route';
import { routeDash } from './dashboard/dashboard.route';
import { routeDiscover } from './discover/discover.route';
import { routeForums } from './forums/forums.route';
import { routeHome } from './home/home.route';
import { routeIntent } from './intent/intent.route';
import { routeLanding } from './landing/landing.route';
import { routeLegal } from './legal/legal.route';
import { routeLibrary } from './library/library.route';
import { routeNotifications } from './notifications/notifications.route';
import { routeProfile } from './profile/profile.route';
import { routeSearch } from './search/search.route';
import { routeSettings } from './settings/settings.route';
import { routeStyleguide } from './styleguide/styleguide.route';
import { routeWelcome } from './welcome/welcome.route';
import { routeWeplay } from './weplay/weplay.route';

const routes = [
	routeHome,
	routeDiscover,
	routeCommunitiesView,
	routeLanding,
	routeSearch,
	routeProfile,
	routeLibrary,
	routeDash,
	routeNotifications,
	routeSettings,
	routeForums,
	routeStyleguide,
	routeLegal,
	routeIntent,
	routeWeplay,
	routeWelcome,
];

export const router = initRouter(routes);

router.beforeEach((to, _from, next) => {
	if (to.matched.some(record => record.meta.hideShell)) {
		store.commit('hideShell');
	} else {
		store.commit('showShell');
	}
	next();
});
