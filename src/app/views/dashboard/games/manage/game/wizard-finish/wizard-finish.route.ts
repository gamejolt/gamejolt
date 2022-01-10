import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameWizardFinish: RouteRecordRaw = {
	name: 'dash.games.manage.game.wizard-finish',
	path: 'wizard-finish',
	component: () => import('./wizard-finish.vue'),
};
