import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiDataStorageItemsView: RouteRecordRaw = {
	name: 'dash.games.manage.api.data-storage.items.view',
	path: 'data-storage/items/:item(\\d+)',
	component: () => import('./RouteDashGamesManageApiDataStorageItemsView.vue'),
};
