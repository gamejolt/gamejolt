import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageDevlog: RouteRecordRaw = {
	name: 'dash.games.manage.devlog',
	path: 'devlog',
	component: () => import('~app/views/dashboard/games/manage/devlog/RouteDashGamesManageDevlog.vue'),
};
