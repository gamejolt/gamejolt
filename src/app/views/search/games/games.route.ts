import VueRouter from 'vue-router';

export const routeSearchGames: VueRouter.RouteConfig = {
	name: 'search.games',
	path: 'games',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearchGames" */ './games'),
};
