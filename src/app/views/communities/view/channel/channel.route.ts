import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewChannelFeed } from './feed/feed.route';
import { routeCommunitiesViewChannelGames } from './games/games.route';

export const routeCommunitiesViewChannel: RouteConfig = {
	name: 'communities.view.channel',
	path: ':channel',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewChannel" */ './channel.vue'),
	children: [routeCommunitiesViewChannelFeed, routeCommunitiesViewChannelGames],
};
