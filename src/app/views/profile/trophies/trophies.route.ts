import { RouteRecordRaw } from 'vue-router';

import { routeProfileTrophiesAll } from '~app/views/profile/trophies/all/all.route';
import { routeProfileTrophiesGame } from '~app/views/profile/trophies/game/game.route';
import { routeProfileTrophiesOverview } from '~app/views/profile/trophies/overview/overview.route';
import { routeProfileTrophiesSite } from '~app/views/profile/trophies/site/site.route';

export const routeProfileTrophies: RouteRecordRaw = {
	path: 'trophies',
	component: () => import('~app/views/profile/trophies/RouteProfileTrophies.vue'),
	children: [
		routeProfileTrophiesOverview,
		routeProfileTrophiesAll,
		routeProfileTrophiesSite,
		routeProfileTrophiesGame,
	],
};
