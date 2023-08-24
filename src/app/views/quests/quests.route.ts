import { RouteRecordRaw } from 'vue-router';
import { routeHome } from '../home/home.route';
import { routeQuestsView } from './view/view.route';

export const routeQuests: RouteRecordRaw = {
	name: 'quests',
	path: '/quests',
	redirect() {
		return {
			...routeHome,
			hash: `#quest`,
		};
	},
	children: [routeQuestsView],
};
