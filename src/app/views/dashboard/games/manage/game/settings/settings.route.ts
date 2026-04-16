import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageGameSettings: RouteRecordRaw = {
	name: 'dash.games.manage.game.settings',
	path: 'settings',
	component: () => import('~app/views/dashboard/games/manage/game/settings/RouteDashGamesManageGameSettings.vue'),
};
