import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiScoreboardsList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.scoreboards.list',
	path: 'scoreboards',
	props: true,
	component: () => asyncComponentLoader($import('./list')),
};
