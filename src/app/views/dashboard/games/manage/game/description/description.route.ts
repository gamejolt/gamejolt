import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameDescription: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.description',
	path: 'description',
	props: true,
	component: () => asyncComponentLoader($import('./description')),
	children: [
		{
			path: '/dashboard/developer/games/description/:id(\\d+)',
			redirect: { name: 'dash.games.manage.game.description' },
		},
	],
};
