import { RouteRecordRaw } from 'vue-router';

export const routeQuestsView: RouteRecordRaw = {
	name: 'quests.view',
	path: ':id',
	component: () => import('./RouteQuestsView.vue'),
};
