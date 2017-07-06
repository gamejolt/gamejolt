import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameSettings: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.settings',
	path: 'settings',
	props: true,
	component: () => asyncComponentLoader(import('./settings')),
};
