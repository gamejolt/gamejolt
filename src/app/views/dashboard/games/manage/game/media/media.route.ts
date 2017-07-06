import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameMedia: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.media',
	path: 'media',
	props: true,
	component: () => asyncComponentLoader(import('./media')),
};
