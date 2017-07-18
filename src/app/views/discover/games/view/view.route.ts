import VueRouter from 'vue-router';

import { routeDiscoverGamesViewOverview } from './overview/overview.route';
import { routeDiscoverGamesViewDevlogList } from './devlog/list/list.route';
import { routeDiscoverGamesViewDevlogView } from './devlog/view/view.route';
import { routeDiscoverGamesViewComments } from './comments/comments.route';
import { routeDiscoverGamesViewDownloadBuild } from './download/build/build.route';
import { routeDiscoverGamesViewTrophiesList } from './trophies/list/list.route';
import { routeDiscoverGamesViewScoresList } from './scores/list/list.route';
import { routeDiscoverGamesViewDownloadSoundtrack } from './download/soundtrack/soundtrack.route';

export const routeDiscoverGamesView: VueRouter.RouteConfig = {
	path: ':slug/:id(\\d+)',
	props: true,
	component: () => import('./view'),
	children: [
		routeDiscoverGamesViewOverview,
		routeDiscoverGamesViewDevlogList,
		routeDiscoverGamesViewDevlogView,
		routeDiscoverGamesViewComments,
		routeDiscoverGamesViewDownloadBuild,
		routeDiscoverGamesViewDownloadSoundtrack,
		routeDiscoverGamesViewTrophiesList,
		routeDiscoverGamesViewScoresList,
	],
	meta: {
		scrollAnchorKey: 'id',
	},
};
