import { RouteRecordRaw } from 'vue-router';
import { routeProfileOverviewFeed } from './feed/feed.route';

export const routeProfileOverview: RouteRecordRaw = {
	path: '',
	// Add this component into the same webpack chunk as the main "profile" chunk.
	component: () => import('./RouteProfileOverview.vue'),
	children: [routeProfileOverviewFeed],
};
