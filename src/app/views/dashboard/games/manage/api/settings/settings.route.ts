import VueRouter from 'vue-router';

export const routeDashGamesManageApiSettings: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.settings',
	path: 'settings',
	props: true,
	component: () => import('./settings'),
};
