import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewDownloadBuild: RouteConfig = {
	name: 'discover.games.view.download.build',
	path: 'download/build/:buildId',
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './build.vue'),
};
