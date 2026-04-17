import { RouteRecordRaw } from 'vue-router';

import { routeDashGamesAdd } from '~app/views/dashboard/games/add/add.route';
import { routeDashGamesManage } from '~app/views/dashboard/games/manage/manage.route';

export const routeDashGames: RouteRecordRaw = {
	path: 'games',
	component: () => import('~app/views/dashboard/games/RouteDashGames.vue'),
	children: [routeDashGamesAdd, routeDashGamesManage],
};
