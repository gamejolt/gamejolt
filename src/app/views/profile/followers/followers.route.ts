import { RouteConfig } from 'vue-router';

export const routeProfileFollowers: RouteConfig = {
	name: 'profile.followers',
	path: 'followers',
	// Put all the "follow" routes in same chunk.
	component: () => import(/* webpackChunkName: "routeProfileFollowList" */ './followers'),
};
