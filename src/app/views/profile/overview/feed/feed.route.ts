import { RouteRecordRaw } from 'vue-router';

export const routeProfileOverviewFeed: RouteRecordRaw = {
	// We set this as the profile overview page so that the feed loads in
	// lazily.
	name: 'profile.overview',
	path: '/@:username/:feedSection(likes)?',
	component: () => import('./RouteProfileOverviewFeed.vue'),
};
