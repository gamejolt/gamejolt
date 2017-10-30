import { RouteConfig } from 'vue-router';

import { routeDashGamesManageGame } from './game/game.route';
import { routeDashGamesManageApi } from './api/api.route';
import { routeDashGamesManageKeyGroupsList } from './key-groups/list/list.route';
import { routeDashGamesManageKeyGroupsEdit } from './key-groups/edit/edit.route';
import { routeDashGamesManageDevlog } from './devlog/devlog.route';
import { routeDashGamesManageSite } from './site/site.route';
import { routeDashGamesManageCollaborators } from './collaborators/collaborators.route';

export const routeDashGamesManage: RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	props: true,
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
