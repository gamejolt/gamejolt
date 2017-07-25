import VueRouter from 'vue-router';

export const routeDashGamesManageApiTrophies: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.trophies.list',
	path: 'trophies',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageApiTrophies" */ './trophies'),
};
