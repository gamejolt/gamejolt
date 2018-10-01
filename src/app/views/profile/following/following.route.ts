import { RouteConfig } from 'vue-router';

export const routeProfileFollowing: RouteConfig = {
	name: 'profile.following',
	path: 'following',
	props: true,
	// Put all the "follow" routes in same chunk.
	component: () => import(/* webpackChunkName: "routeProfileFollowList" */ './following'),
};
