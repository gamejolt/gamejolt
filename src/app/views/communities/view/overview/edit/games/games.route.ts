import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewOverviewEditGames: RouteConfig = {
	name: 'communities.view.overview.edit.games',
	path: 'games',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverviewEditGames" */ './games.vue'),
};
