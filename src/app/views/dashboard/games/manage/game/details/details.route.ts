import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameDetails: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.details',
	path: 'details',
	props: true,
	component: () => asyncComponentLoader($import('./details')),
	children: [
		{
			path: '/dashboard/developer/games/details/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.details' },
		},
	],
};
