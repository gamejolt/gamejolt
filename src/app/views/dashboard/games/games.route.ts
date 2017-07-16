import VueRouter from 'vue-router';

import { routeDashGamesManage } from './manage/manage.route';

export const routeDashGames: VueRouter.RouteConfig = {
	path: 'games',
	props: true,
	component: () => import('./games'),
	children: [routeDashGamesManage],
};
