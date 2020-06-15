import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditGames: RouteConfig = {
	name: 'communities.view.edit.games',
	path: 'games',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './games.vue'),
};
