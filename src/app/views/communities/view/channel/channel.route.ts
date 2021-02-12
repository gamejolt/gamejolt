import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewChannelEntries } from './entries/entries.route';
import { routeCommunitiesViewChannelFeed } from './feed/feed.route';

export const routeCommunitiesViewChannel: RouteConfig = {
	path: ':channel',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewChannel" */ './channel.vue'),
	children: [routeCommunitiesViewChannelFeed, routeCommunitiesViewChannelEntries],
};
