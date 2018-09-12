import { RouteConfig } from 'vue-router';

import { routeDiscoverGamesViewOverview } from './overview/overview.route';
import { routeDiscoverGamesViewDevlogList } from './devlog/list/list.route';
import { routeDiscoverGamesViewDevlogView } from './devlog/view/view.route';
import { routeDiscoverGamesViewDownloadBuild } from './download/build/build.route';
import { routeDiscoverGamesViewTrophiesList } from './trophies/list/list.route';
import { routeDiscoverGamesViewScoresList } from './scores/list/list.route';
import { routeDiscoverGamesViewDownloadSoundtrack } from './download/soundtrack/soundtrack.route';

export const routeDiscoverGamesView: RouteConfig = {
	path: ':slug/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './view'),
	children: [
		routeDiscoverGamesViewOverview,
		routeDiscoverGamesViewDevlogList,
		routeDiscoverGamesViewDevlogView,
		routeDiscoverGamesViewDownloadBuild,
		routeDiscoverGamesViewDownloadSoundtrack,
		routeDiscoverGamesViewTrophiesList,
		routeDiscoverGamesViewScoresList,
	],
};
