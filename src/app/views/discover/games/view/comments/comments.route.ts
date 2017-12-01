import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewComments: RouteConfig = {
	name: 'discover.games.view.comments',
	path: 'comments',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './comments'),
};
