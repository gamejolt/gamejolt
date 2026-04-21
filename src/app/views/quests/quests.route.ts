import { RouteRecordRaw } from 'vue-router';

import { routeHome } from '~app/views/home/home.route';
import { routeQuestsView } from '~app/views/quests/view/view.route';
import { Environment } from '~common/environment/environment.service';

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

/**
 * Resolves to the `#quest` hash (handled by the shell's hash-event system) when
 * called from the app section, or a full URL back to the app otherwise.
 */
export function routeUrlQuests() {
	return GJ_SECTION === 'app' ? '#quest' : `${Environment.baseUrl}/#quest`;
}
