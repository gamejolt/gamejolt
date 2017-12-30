import { RouteConfig } from 'vue-router';

export const routeDashGamesManageGameWizardFinish: RouteConfig = {
	name: 'dash.games.manage.game.wizard-finish',
	path: 'wizard-finish',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageGameWizardFinish" */ './wizard-finish'),
};
