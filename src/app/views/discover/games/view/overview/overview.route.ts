import { RouteConfig } from 'vue-router';
import { hasGamePage3ColSplitTest } from '../../../../../components/split-test/split-test-service';

export const routeDiscoverGamesViewOverview: RouteConfig = {
	name: 'discover.games.view.overview',
	path: '/games/:slug/:id(\\d+)',
	component: () => {
		return hasGamePage3ColSplitTest()
			? import(/* webpackChunkName: "routeDiscoverGamesView3Col" */ './overview-3col')
			: import(/* webpackChunkName: "routeDiscoverGamesView" */ './overview');
	},
};
