import { RouteRecordRaw } from 'vue-router';
import { routeDiscoverGamesViewDevlogView } from './devlog/view/view.route';
import { routeDiscoverGamesViewFollowers } from './followers/followers.route';
import { routeDiscoverGamesViewOverview } from './overview/overview.route';
import { routeDiscoverGamesViewScoresList } from './scores/list/list.route';
import { routeDiscoverGamesViewTrophiesList } from './trophies/list/list.route';

export const routeDiscoverGamesView: RouteRecordRaw = {
	path: ':slug/:id(\\d+)',
	component: () => import('./RouteDiscoverGamesView.vue'),
	children: [
		routeDiscoverGamesViewOverview,
		routeDiscoverGamesViewDevlogView,
		routeDiscoverGamesViewTrophiesList,
		routeDiscoverGamesViewScoresList,
		routeDiscoverGamesViewFollowers,
	],
};
