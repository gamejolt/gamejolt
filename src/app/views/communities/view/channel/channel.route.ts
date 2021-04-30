import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewChannel: RouteConfig = {
	name: 'communities.view.channel',
	path: ':channel',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewChannel" */ './channel.vue'),
};
