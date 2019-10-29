import { RouteConfig } from 'vue-router';

export const routeProfileTrophiesGame: RouteConfig = {
	path: 'game/:id(\\d+)',
	name: 'profile.trophies.game',
	component: () => import(/* webpackChunkName: "routeProfileTrophiesGame" */ './game.vue'),
};
