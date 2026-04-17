import { RouteRecordRaw } from 'vue-router';

import { routeDashGamesManageApiDataStorageItemsList } from '~app/views/dashboard/games/manage/api/data-storage/items/list/list.route';
import { routeDashGamesManageApiDataStorageItemsView } from '~app/views/dashboard/games/manage/api/data-storage/items/view/view.route';
import { routeDashGamesManageApiOverview } from '~app/views/dashboard/games/manage/api/overview/overview.route';
import { routeDashGamesManageApiScoreboardsList } from '~app/views/dashboard/games/manage/api/scoreboards/list/list.route';
import { routeDashGamesManageApiScoreboardsScoresList } from '~app/views/dashboard/games/manage/api/scoreboards/scores/list/list.route';
import { routeDashGamesManageApiScoreboardsScoreUser } from '~app/views/dashboard/games/manage/api/scoreboards/scores/user/user.route';
import { routeDashGamesManageApiScoreboardsScoresView } from '~app/views/dashboard/games/manage/api/scoreboards/scores/view/view.route';
import { routeDashGamesManageApiSettings } from '~app/views/dashboard/games/manage/api/settings/settings.route';
import { routeDashGamesManageApiTrophies } from '~app/views/dashboard/games/manage/api/trophies/trophies.route';

export const routeDashGamesManageApi: RouteRecordRaw = {
	path: 'api',
	component: () => import('~app/views/dashboard/games/manage/api/RouteDashGamesManageApi.vue'),
	children: [
		routeDashGamesManageApiOverview,
		routeDashGamesManageApiTrophies,
		routeDashGamesManageApiDataStorageItemsList,
		routeDashGamesManageApiDataStorageItemsView,
		routeDashGamesManageApiScoreboardsList,
		routeDashGamesManageApiScoreboardsScoresList,
		routeDashGamesManageApiScoreboardsScoresView,
		routeDashGamesManageApiScoreboardsScoreUser,
		routeDashGamesManageApiSettings,
	],
};
