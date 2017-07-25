import VueRouter from 'vue-router';

export const routeDashGamesManageDevlog: VueRouter.RouteConfig = {
	name: 'dash.games.manage.devlog',
	path: 'devlog/:tab(active|draft)?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageDevlog" */ './devlog'),
};
