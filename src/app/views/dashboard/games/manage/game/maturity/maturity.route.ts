import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameMaturity: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.maturity',
	path: 'maturity',
	props: true,
	component: () => asyncComponentLoader(import('./maturity')),
};
