import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverGamesViewDevlogList: VueRouter.RouteConfig = {
	name: 'discover.games.view.devlog.list',
	path: 'devlog',
	props: true,
	component: () => asyncComponentLoader( $import( './list' ) ),
};
