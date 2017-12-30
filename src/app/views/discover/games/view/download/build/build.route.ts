import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewDownloadBuild: RouteConfig = {
	name: 'discover.games.view.download.build',
	path: 'download/build/:buildId',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './build'),
};
