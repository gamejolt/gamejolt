import { RouteRecordRaw } from 'vue-router';

import { routeHome } from '~app/views/home/home.route';
import { routeQuestsView } from '~app/views/quests/view/view.route';

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
