import { RouteRecordRaw } from 'vue-router';
import { routeProfileTrophiesAll } from './all/all.route';
import { routeProfileTrophiesGame } from './game/game.route';
import { routeProfileTrophiesOverview } from './overview/overview.route';
import { routeProfileTrophiesSite } from './site/site.route';

export const routeProfileTrophies: RouteRecordRaw = {
	path: 'trophies',
	component: () => import('./trophies.vue'),
	children: [
		routeProfileTrophiesOverview,
		routeProfileTrophiesAll,
		routeProfileTrophiesSite,
		routeProfileTrophiesGame,
	],
};
