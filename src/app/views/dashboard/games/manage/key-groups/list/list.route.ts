import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageKeyGroupsList: RouteRecordRaw = {
	name: 'dash.games.manage.key-groups.list',
	path: 'keys',
	component: () => import('~app/views/dashboard/games/manage/key-groups/list/RouteDashGamesManageKeyGroupsList.vue'),
};
