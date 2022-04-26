import { initRouter } from '../../utils/router';
import { routeBadgeFeatured } from './badge/featured/featured.route';
import { routeCommunitiesView } from './communities/view/view.route';
import { routeDash } from './dashboard/dashboard.route';
import { routeDiscover } from './discover/discover.route';
import { routeDownload } from './download/download.route';
import { routeFireside } from './fireside/fireside.route';
import { routeForums } from './forums/forums.route';
import { routeHome } from './home/home.route';
import { routeIntent } from './intent/intent.route';
import { routeLanding } from './landing/landing.route';
import { routeLegal } from './legal/legal.route';
import { routeLibrary } from './library/library.route';
import { routeNotifications } from './notifications/notifications.route';
import { routePost } from './post/post.route';
import { routeProfile } from './profile/profile.route';
import { routeQuests } from './quests/quests.route';
import { routeRealmsView } from './realms/view/view.route';
import { routeSearch } from './search/search.route';
import { routeSettings } from './settings/settings.route';
import { routeStyleguide } from './styleguide/styleguide.route';
import { routeTimeout } from './timeout/timeout.route';
import { routeWelcome } from './welcome/welcome.route';
import { routeWeplay } from './weplay/weplay.route';

const routes = [
	routeHome,
	routeDiscover,
	routeDownload,
	routeCommunitiesView,
	routeLanding,
	routeSearch,
	routePost,
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
	routeBadgeFeatured,
	routeTimeout,
	routeFireside,
	routeRealmsView,
	routeQuests,
];

export const router = initRouter(routes);
