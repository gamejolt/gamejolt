import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameWizardFinish: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.wizard-finish',
	path: 'wizard-finish',
	props: true,
	component: () => asyncComponentLoader(import('./wizard-finish')),
};
