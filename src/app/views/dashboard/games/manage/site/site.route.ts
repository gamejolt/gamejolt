import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageSite: RouteRecordRaw = {
	name: 'dash.games.manage.site',
	path: 'site/:siteTab?',
	component: () => import('~app/views/dashboard/games/manage/site/RouteDashGamesManageSite.vue'),
};
