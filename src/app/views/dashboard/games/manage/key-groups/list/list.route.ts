import VueRouter from 'vue-router';

export const routeDashGamesManageKeyGroupsList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.key-groups.list',
	path: 'keys',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageKeyGroupsList" */ './list'),
};
