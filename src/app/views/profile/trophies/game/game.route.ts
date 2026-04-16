import { RouteRecordRaw } from 'vue-router';

export const routeProfileTrophiesGame: RouteRecordRaw = {
	path: 'game/:id(\\d+)',
	name: 'profile.trophies.game',
	component: () => import('~app/views/profile/trophies/game/RouteProfileTrophiesGame.vue'),
};
