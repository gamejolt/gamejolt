import { RouteConfig } from 'vue-router';
import { routeDashGamesManageApi } from './api/api.route';
import { routeDashGamesManageCollaborators } from './collaborators/collaborators.route';
import { routeDashGamesManageDevlog } from './devlog/devlog.route';
import { routeDashGamesManageGame } from './game/game.route';
import { routeDashGamesManageKeyGroupsEdit } from './key-groups/edit/edit.route';
import { routeDashGamesManageKeyGroupsList } from './key-groups/list/list.route';
import { routeDashGamesManageSite } from './site/site.route';

export const routeDashGamesManage: RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeDashGamesManage" */ './manage'),
	children: [
		routeDashGamesManageGame,
		routeDashGamesManageApi,
		routeDashGamesManageKeyGroupsList,
		routeDashGamesManageKeyGroupsEdit,
		routeDashGamesManageDevlog,
		routeDashGamesManageSite,
		routeDashGamesManageCollaborators,
	],
};
