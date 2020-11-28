import { RouteConfig } from 'vue-router';
import { routeDiscoverGamesViewDevlogView } from './devlog/view/view.route';
import { routeDiscoverGamesViewFollowers } from './followers/followers.route';
import { routeDiscoverGamesViewOverview } from './overview/overview.route';
import { routeDiscoverGamesViewScoresList } from './scores/list/list.route';
import { routeDiscoverGamesViewTrophiesList } from './trophies/list/list.route';

export const routeDiscoverGamesView: RouteConfig = {
	path: ':slug/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './view.vue'),
	children: [
		routeDiscoverGamesViewOverview,
		routeDiscoverGamesViewDevlogView,
		routeDiscoverGamesViewTrophiesList,
		routeDiscoverGamesViewScoresList,
		routeDiscoverGamesViewFollowers,
	],
};
