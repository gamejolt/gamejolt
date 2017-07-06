import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiScoreboardsScoresList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.list',
	path: 'scoreboards/:table(\\d+)',
	props: true,
	component: () => asyncComponentLoader(import('./list')),
};
