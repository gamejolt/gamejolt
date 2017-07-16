import VueRouter from 'vue-router';

export const routeDashGamesManageGameWizardFinish: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.wizard-finish',
	path: 'wizard-finish',
	props: true,
	component: () => import('./wizard-finish'),
};
