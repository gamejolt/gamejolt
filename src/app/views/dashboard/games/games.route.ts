import { RouteRecordRaw } from 'vue-router';
import { routeDashGamesAdd } from './add/add.route';
import { routeDashGamesManage } from './manage/manage.route';

export const routeDashGames: RouteRecordRaw = {
	path: 'games',
	component: () => import(/* webpackChunkName: "routeDashGames" */ './games'),
	children: [routeDashGamesAdd, routeDashGamesManage],
};
