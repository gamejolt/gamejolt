import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiDataStorageItemsList: RouteRecordRaw = {
	name: 'dash.games.manage.api.data-storage.items.list',
	path: 'data-storage/items',
	component: () => import('./RouteDashGamesManageApiDataStorageItemsList.vue'),
};
