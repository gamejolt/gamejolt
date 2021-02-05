import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewChannelFeed: RouteConfig = {
	name: 'communities.view.channel.feed',
	path: '/c/:path/:channel',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewChannel" */ './feed.vue'),
};
