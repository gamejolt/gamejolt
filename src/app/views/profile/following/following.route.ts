import { RouteRecordRaw } from 'vue-router';

export const routeProfileFollowing: RouteRecordRaw = {
	name: 'profile.following',
	path: 'following',
	// Put all the "follow" routes in same chunk.
	component: () => import('./following.vue'),
};
