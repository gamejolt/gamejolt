import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiDataStorageItemsView: RouteRecordRaw = {
	name: 'dash.games.manage.api.data-storage.items.view',
	path: 'data-storage/items/:item(\\d+)',
	component: () =>
		import(
			'~app/views/dashboard/games/manage/api/data-storage/items/view/RouteDashGamesManageApiDataStorageItemsView.vue'
		),
};
