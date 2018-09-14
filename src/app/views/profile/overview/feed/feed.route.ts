import { RouteConfig } from 'vue-router';

export const routeProfileOverviewFeed: RouteConfig = {
	// We set this as the profile overview page so that the feed loads in lazily.
	name: 'profile.overview',
	// path: '/@:username/:sub(draft-posts|scheduled-posts)?',
	path: ':sub(draft-posts|scheduled-posts)?',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfileOverviewFeed" */ './feed'),
};
