import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { routeDashGamesManageGame } from './game/game.route';
import { routeDashGamesManageGameDescription } from './game/description/description.route';

export const routeDashGamesManage: VueRouter.RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => asyncComponentLoader( $import( './manage' ) ),
	children: [
		routeDashGamesManageGame,
		routeDashGamesManageGameDescription,
	],
};
