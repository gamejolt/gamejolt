import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewChannelGames: RouteConfig = {
	name: 'communities.view.channel.games',
	path: 'games',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewChannelCompetition" */ './games.vue'),
};
