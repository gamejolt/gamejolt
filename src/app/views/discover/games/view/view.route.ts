import { RouteConfig } from 'vue-router';
import { routeDiscoverGamesViewDevlogView } from './devlog/view/view.route';
import { routeDiscoverGamesViewDownloadBuild } from './download/build/build.route';
import { routeDiscoverGamesViewDownloadSoundtrack } from './download/soundtrack/soundtrack.route';
import { routeDiscoverGamesViewFollowers } from './followers/followers.route';
import { routeDiscoverGamesViewOverview } from './overview/overview.route';
import { routeDiscoverGamesViewScoresList } from './scores/list/list.route';
import { routeDiscoverGamesViewTrophiesList } from './trophies/list/list.route';

export const routeDiscoverGamesView: RouteConfig = {
	path: ':slug/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './view'),
	children: [
		routeDiscoverGamesViewOverview,
		routeDiscoverGamesViewDevlogView,
		routeDiscoverGamesViewDownloadBuild,
		routeDiscoverGamesViewDownloadSoundtrack,
		routeDiscoverGamesViewTrophiesList,
		routeDiscoverGamesViewScoresList,
		routeDiscoverGamesViewFollowers,
	],
};
