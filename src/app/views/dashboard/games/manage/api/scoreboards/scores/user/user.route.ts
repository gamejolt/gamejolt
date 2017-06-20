import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiScoreboardsScoreUser: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.scores.user',
	path: 'scoreboards/:table(\\d+)/user/:user(\\d+)',
	props: true,
	component: () => asyncComponentLoader($import('./user')),
};
