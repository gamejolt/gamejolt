import { RouteConfig } from 'vue-router';
import { routeProfileOverviewFeed } from './feed/feed.route';

export const routeProfileOverview: RouteConfig = {
	// path: '/@:username',
	path: '',
	props: true,
	// Add this component into the same webpack chunk as the main "profile" chunk.
	component: () => import(/* webpackChunkName: "routeProfile" */ './overview'),
	children: [routeProfileOverviewFeed],
};
