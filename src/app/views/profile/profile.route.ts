import { RouteRecordRaw } from 'vue-router';
import { routeProfileFollowers } from './followers/followers.route';
import { routeProfileFollowing } from './following/following.route';
import { routeProfileLibrary } from './library/library.route';
import { routeProfileOverview } from './overview/overview.route';
import { routeProfilePostView } from './post/view.route';
import { routeProfileTrophies } from './trophies/trophies.route';
import { routeProfileVideos } from './videos/videos.route';

export const routeProfile: RouteRecordRaw = {
	path: '/@:username',
	component: () => import('./RouteProfile.vue'),
	children: [
		routeProfileOverview,
		routeProfileLibrary,
		routeProfilePostView,
		routeProfileVideos,
		// TODO(profile-scrunch) remove, make modal
		routeProfileFollowers,
		// TODO(profile-scrunch) remove, make modal
		routeProfileFollowing,
		// TODO(profile-scrunch) keep, make modal
		routeProfileTrophies,
	],
};
