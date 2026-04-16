import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameDesign: RouteRecordRaw = {
	name: 'dash.games.manage.game.design',
	path: 'design',
	component: () => import('~app/views/dashboard/games/manage/game/design/RouteDashGamesManageGameDesign.vue'),
};
