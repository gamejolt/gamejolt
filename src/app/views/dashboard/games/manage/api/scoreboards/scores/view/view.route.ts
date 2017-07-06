import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiScoreboardsScoresView: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.view',
	path: 'scoreboards/:table(\\d+)/:score(\\d+)',
	props: true,
	component: () => asyncComponentLoader(import('./view')),
};
