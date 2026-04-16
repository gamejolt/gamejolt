import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoresView: RouteRecordRaw = {
	name: 'dash.games.manage.api.scoreboards.scores.view',
	path: 'scoreboards/:table(\\d+)/:score(\\d+)',
	component: () => import('~app/views/dashboard/games/manage/api/scoreboards/scores/view/RouteDashGamesManageApiScoreboardsScoresView.vue'),
};
