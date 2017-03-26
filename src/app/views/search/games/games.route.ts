import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeSearchGames: VueRouter.RouteConfig = {
	name: 'search.games',
	path: 'games',
	component: () => asyncComponentLoader( $import( './games' ) ),
};
