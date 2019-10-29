import { RouteConfig } from 'vue-router';
import { routeProfileTrophiesAll } from './all/all.route';
import { routeProfileTrophiesGame } from './game/game.route';
import { routeProfileTrophiesOverview } from './overview/overview.route';
import { routeProfileTrophiesSite } from './site/site.route';

export const routeProfileTrophies: RouteConfig = {
	path: 'trophies',
	component: () => import(/* webpackChunkName: "routeProfileTrophies" */ './trophies.vue'),
	children: [
		routeProfileTrophiesOverview,
		routeProfileTrophiesAll,
		routeProfileTrophiesSite,
		routeProfileTrophiesGame,
	],
};
