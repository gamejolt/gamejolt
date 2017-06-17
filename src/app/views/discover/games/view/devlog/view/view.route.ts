import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverGamesViewDevlogView: VueRouter.RouteConfig = {
	name: 'discover.games.view.devlog.view',
	path: 'devlog/:postSlug',
	props: true,
	component: () => asyncComponentLoader($import('./view')),
};
