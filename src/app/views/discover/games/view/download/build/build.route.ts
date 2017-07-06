import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverGamesViewDownloadBuild: VueRouter.RouteConfig = {
	name: 'discover.games.view.download.build',
	path: 'download/build/:buildId',
	props: true,
	component: () => asyncComponentLoader(import('./build')),
};
