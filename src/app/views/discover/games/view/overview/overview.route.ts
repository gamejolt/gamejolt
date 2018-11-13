import { RouteConfig } from 'vue-router';
import { hasGamePage3ColSplitTest } from '../../../../../components/split-test/split-test-service';

export const routeDiscoverGamesViewOverview: RouteConfig = {
	name: 'discover.games.view.overview',
	path: '/games/:slug/:id(\\d+)',
	props: true,
	component: () => {
		return hasGamePage3ColSplitTest()
			? import(/* webpackChunkName: "routeDiscoverGamesView" */ './overview')
			: import(/* webpackChunkName: "routeDiscoverGamesView3Col" */ './overview-3col');
	},
};
