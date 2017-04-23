import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverChannelsViewGames: VueRouter.RouteConfig = {
	name: 'discover.channels.view.games',
	path: 'games/:section?',
	component: () => asyncComponentLoader( $import( './games' ) ),
};
