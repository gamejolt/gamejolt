import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverDevlogsGames: VueRouter.RouteConfig = {
	name: 'discover.devlogs.games',
	path: 'games/:section?',
	props: true,
	component: () => asyncComponentLoader($import('./games')),
};
