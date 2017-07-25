import VueRouter from 'vue-router';

import { routeDashGamesManage } from './manage/manage.route';
import { routeDashGamesAdd } from './add/add.route';

export const routeDashGames: VueRouter.RouteConfig = {
	path: 'games',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGames" */ './games'),
	children: [routeDashGamesAdd, routeDashGamesManage],
};
