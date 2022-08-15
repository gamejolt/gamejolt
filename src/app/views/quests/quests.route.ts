import { RouteRecordRaw } from 'vue-router';
import { routeQuestsView } from './view/view.route';

export const routeQuests: RouteRecordRaw = {
	name: 'quests',
	path: '/quests',
	component: () => import('./RouteQuests.vue'),
	children: [routeQuestsView],
};
