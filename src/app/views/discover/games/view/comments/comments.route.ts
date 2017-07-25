import VueRouter from 'vue-router';

export const routeDiscoverGamesViewComments: VueRouter.RouteConfig = {
	name: 'discover.games.view.comments',
	path: 'comments',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesViewComments" */ './comments'),
};
