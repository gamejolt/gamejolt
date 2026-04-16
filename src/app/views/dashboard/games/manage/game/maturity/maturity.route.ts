import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameMaturity: RouteRecordRaw = {
	name: 'dash.games.manage.game.maturity',
	path: 'maturity',
	component: () => import('~app/views/dashboard/games/manage/game/maturity/RouteDashGamesManageGameMaturity.vue'),
};
