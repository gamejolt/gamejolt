import { RouteRecordRaw } from 'vue-router';

export const routeProfileFollowers: RouteRecordRaw = {
	name: 'profile.followers',
	path: 'followers',
	// Put all the "follow" routes in same chunk.
	component: () => import('./followers.vue'),
};
