import { RouteConfig } from 'vue-router';
import { routeProfileFollowers } from './followers/followers.route';
import { routeProfileFollowing } from './following/following.route';
import { routeProfileLibrary } from './library/library.route';
import { routeProfileOverview } from './overview/overview.route';
import { routeProfilePostView } from './post/view.route';
import { routeProfileVideos } from './videos/videos.route';

export const routeProfile: RouteConfig = {
	path: '/@:username',
	component: () => import(/* webpackChunkName: "routeProfile" */ './profile'),
	children: [
		routeProfileOverview,
		routeProfileLibrary,
		routeProfilePostView,
		routeProfileVideos,
		routeProfileFollowers,
		routeProfileFollowing,
	],
};
