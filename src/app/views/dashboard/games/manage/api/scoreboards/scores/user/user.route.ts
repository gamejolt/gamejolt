import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiScoreboardsScoreUser: RouteRecordRaw = {
	name: 'dash.games.manage.api.scoreboards.scores.user',
	path: 'scoreboards/:table(\\d+)/user/:user(\\d+)',
	component: () => import('~app/views/dashboard/games/manage/api/scoreboards/scores/user/RouteDashGamesManageApiScoreboardsScoresUser.vue'),
};
