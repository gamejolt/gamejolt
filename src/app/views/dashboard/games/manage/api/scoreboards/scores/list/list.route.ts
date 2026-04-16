import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoresList: RouteRecordRaw = {
	name: 'dash.games.manage.api.scoreboards.scores.list',
	path: 'scoreboards/:table(\\d+)',
	component: () => import('~app/views/dashboard/games/manage/api/scoreboards/scores/list/RouteDashGamesManageApiScoreboardsScoresList.vue'),
};
