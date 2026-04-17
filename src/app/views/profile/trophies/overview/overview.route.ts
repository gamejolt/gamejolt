import { RouteRecordRaw } from 'vue-router';

export const routeProfileTrophiesOverview: RouteRecordRaw = {
	path: '',
	name: 'profile.trophies',
	component: () =>
		import('~app/views/profile/trophies/overview/RouteProfileTrophiesOverview.vue'),
};
