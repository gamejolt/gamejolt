import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameOverview: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.overview',
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => asyncComponentLoader($import('./overview')),
	children: [
		{
			path: '/dashboard/developer/games/view/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.overview' },
		},
	],
};
