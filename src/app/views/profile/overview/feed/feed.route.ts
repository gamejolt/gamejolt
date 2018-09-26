import { RouteConfig } from 'vue-router';

export const routeProfileOverviewFeed: RouteConfig = {
	// We set this as the profile overview page so that the feed loads in lazily.
	name: 'profile.overview',
	path: '/@:username',
	props: true,
	component: () => import(/* webpackChunkName: "routeProfileOverviewFeed" */ './feed'),
};
