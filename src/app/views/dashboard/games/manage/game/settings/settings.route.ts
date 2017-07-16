import VueRouter from 'vue-router';

export const routeDashGamesManageGameSettings: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.settings',
	path: 'settings',
	props: true,
	component: () => import('./settings'),
};
