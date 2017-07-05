import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { routeDashGamesManageGame } from './game/game.route';
import { routeDashGamesManageApi } from './api/api.route';
import { routeDashGamesManageKeyGroupsList } from './key-groups/list/list.route';
import { routeDashGamesManageKeyGroupsEdit } from './key-groups/edit/edit.route';

export const routeDashGamesManage: VueRouter.RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => asyncComponentLoader($import('./manage')),
	children: [
		routeDashGamesManageGame,
		routeDashGamesManageApi,
		routeDashGamesManageKeyGroupsList,
		routeDashGamesManageKeyGroupsEdit,
	],
};
