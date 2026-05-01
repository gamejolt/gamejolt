import { routeCommunitiesView } from '~app/views/communities/view/view.route';
import { routeDash } from '~app/views/dashboard/dashboard.route';
import { routeDiscover } from '~app/views/discover/discover.route';
import { routeDownload } from '~app/views/download/download.route';
import { routeForums } from '~app/views/forums/forums.route';
import { routeHome } from '~app/views/home/home.route';
import { routeIntent } from '~app/views/intent/intent.route';
import { routeLandingCreators } from '~app/views/landing/creators/creators.route';
import { routeLanding } from '~app/views/landing/landing.route';
import { routeLegal } from '~app/views/legal/legal.route';
import { routeLibrary } from '~app/views/library/library.route';
import { routeNotifications } from '~app/views/notifications/notifications.route';
import { routePost } from '~app/views/post/post.route';
import { routeProfile } from '~app/views/profile/profile.route';
import { routeQuests } from '~app/views/quests/quests.route';
import { routeRealmsView } from '~app/views/realms/view/view.route';
import { routeSearch } from '~app/views/search/search.route';
import { routeStyleguide } from '~app/views/styleguide/styleguide.route';
import { routeTimeout } from '~app/views/timeout/timeout.route';
import { routeWelcome } from '~app/views/welcome/welcome.route';
import { routeWeplay } from '~app/views/weplay/weplay.route';
import { initRouter } from '~utils/router';

export function createAppRouter() {
	return initRouter([
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
		routeForums,
		routeStyleguide,
		routeLegal,
		routeIntent,
		routeWeplay,
		routeWelcome,
		routeTimeout,
		routeRealmsView,
		routeQuests,
		routeLandingCreators,
	]);
}
