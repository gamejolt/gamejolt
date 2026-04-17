import { RouteRecordRaw } from 'vue-router';

import { routeDiscoverGamesViewDevlogView } from '~app/views/discover/games/view/devlog/view/view.route';
import { routeDiscoverGamesViewFollowers } from '~app/views/discover/games/view/followers/followers.route';
import { routeDiscoverGamesViewOverview } from '~app/views/discover/games/view/overview/overview.route';
import { routeDiscoverGamesViewScoresList } from '~app/views/discover/games/view/scores/list/list.route';
import { routeDiscoverGamesViewTrophiesList } from '~app/views/discover/games/view/trophies/list/list.route';

export const routeDiscoverGamesView: RouteRecordRaw = {
	path: ':slug/:id(\\d+)',
	component: () => import('~app/views/discover/games/view/RouteDiscoverGamesView.vue'),
	children: [
		routeDiscoverGamesViewOverview,
		routeDiscoverGamesViewDevlogView,
		routeDiscoverGamesViewTrophiesList,
		routeDiscoverGamesViewScoresList,
		routeDiscoverGamesViewFollowers,
	],
};
