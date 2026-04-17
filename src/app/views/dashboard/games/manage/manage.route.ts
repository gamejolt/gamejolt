import { RouteRecordRaw } from 'vue-router';

import { routeDashGamesManageApi } from '~app/views/dashboard/games/manage/api/api.route';
import { routeDashGamesManageCollaborators } from '~app/views/dashboard/games/manage/collaborators/collaborators.route';
import { routeDashGamesManageDevlog } from '~app/views/dashboard/games/manage/devlog/devlog.route';
import { routeDashGamesManageGame } from '~app/views/dashboard/games/manage/game/game.route';
import { routeDashGamesManageKeyGroupsEdit } from '~app/views/dashboard/games/manage/key-groups/edit/edit.route';
import { routeDashGamesManageKeyGroupsList } from '~app/views/dashboard/games/manage/key-groups/list/list.route';
import { routeDashGamesManageSite } from '~app/views/dashboard/games/manage/site/site.route';

export const routeDashGamesManage: RouteRecordRaw = {
	path: '/dashboard/games/:id(\\d+)',
	component: () => import('~app/views/dashboard/games/manage/RouteDashGamesManage.vue'),
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
