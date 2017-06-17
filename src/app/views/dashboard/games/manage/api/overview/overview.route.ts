import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiOverview: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.overview',
	path: '/dashboard/games/:id(\\d+)/api',
	props: true,
	component: () => asyncComponentLoader($import('./overview')),
	children: [
		{
			path: '/dashboard/developer/games/achievements/:id(\\d+)',
			redirect: { name: 'dash.games.manage.api.overview' },
		},
	],
};
