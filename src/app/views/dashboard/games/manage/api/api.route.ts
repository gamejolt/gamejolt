import VueRouter from 'vue-router';

import { routeDashGamesManageApiOverview } from './overview/overview.route';
import { routeDashGamesManageApiTrophies } from './trophies/trophies.route';
import { routeDashGamesManageApiSettings } from './settings/settings.route';
import { routeDashGamesManageApiDataStorageItemsList } from './data-storage/items/list/list.route';
import { routeDashGamesManageApiDataStorageItemsView } from './data-storage/items/view/view.route';
import { routeDashGamesManageApiScoreboardsList } from './scoreboards/list/list.route';
import { routeDashGamesManageApiScoreboardsScoresList } from './scoreboards/scores/list/list.route';
import { routeDashGamesManageApiScoreboardsScoresView } from './scoreboards/scores/view/view.route';
import { routeDashGamesManageApiScoreboardsScoreUser } from './scoreboards/scores/user/user.route';

export const routeDashGamesManageApi: VueRouter.RouteConfig = {
	path: 'api',
	props: true,
	component: () => import('./api'),
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
