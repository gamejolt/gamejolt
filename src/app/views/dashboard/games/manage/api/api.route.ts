import { RouteRecordRaw } from 'vue-router';
import { routeDashGamesManageApiDataStorageItemsList } from './data-storage/items/list/list.route';
import { routeDashGamesManageApiDataStorageItemsView } from './data-storage/items/view/view.route';
import { routeDashGamesManageApiOverview } from './overview/overview.route';
import { routeDashGamesManageApiScoreboardsList } from './scoreboards/list/list.route';
import { routeDashGamesManageApiScoreboardsScoresList } from './scoreboards/scores/list/list.route';
import { routeDashGamesManageApiScoreboardsScoreUser } from './scoreboards/scores/user/user.route';
import { routeDashGamesManageApiScoreboardsScoresView } from './scoreboards/scores/view/view.route';
import { routeDashGamesManageApiSettings } from './settings/settings.route';
import { routeDashGamesManageApiTrophies } from './trophies/trophies.route';

export const routeDashGamesManageApi: RouteRecordRaw = {
	path: 'api',
	component: () => import('./RouteDashGamesManageApi.vue'),
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
