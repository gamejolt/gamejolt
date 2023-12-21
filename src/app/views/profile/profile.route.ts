import { RouteRecordRaw } from 'vue-router';
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
		{
			name: 'profile.followers',
			path: 'followers',
			redirect: {
				name: 'profile.overview',
			},
		},
		{
			name: 'profile.following',
			path: 'following',
			redirect: {
				name: 'profile.overview',
			},
		},
		routeProfileTrophies,
	],
};
