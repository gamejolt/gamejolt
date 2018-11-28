import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameWizardFinish: RouteConfig = {
	name: 'dash.games.manage.game.wizard-finish',
	path: 'wizard-finish',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameWizardFinish" */ './wizard-finish'),
};
