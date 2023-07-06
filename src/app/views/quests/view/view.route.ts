import { RouteRecordRaw } from 'vue-router';
import { routeHome } from '../../home/home.route';

export const routeQuestsView: RouteRecordRaw = {
	name: 'quests.view',
	path: ':id',
	redirect(to) {
		return {
			...routeHome,
			hash: `#quest-${to.params.id}`,
		};
	},
};
