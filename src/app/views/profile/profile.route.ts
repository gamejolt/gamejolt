import { RouteRecordRaw } from 'vue-router';

import { routeProfileLibrary } from '~app/views/profile/library/library.route';
import { routeProfileOverview } from '~app/views/profile/overview/overview.route';
import { routeProfilePostView } from '~app/views/profile/post/view.route';
import { routeProfileTrophies } from '~app/views/profile/trophies/trophies.route';
import { routeProfileVideos } from '~app/views/profile/videos/videos.route';

export const routeProfile: RouteRecordRaw = {
	path: '/@:username',
	component: () => import('~app/views/profile/RouteProfile.vue'),
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
