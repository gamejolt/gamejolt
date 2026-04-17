import { RouteRecordRaw } from 'vue-router';

export const routeDashGamesManageApiDataStorageItemsList: RouteRecordRaw = {
	name: 'dash.games.manage.api.data-storage.items.list',
	path: 'data-storage/items',
	component: () =>
		import(
			'~app/views/dashboard/games/manage/api/data-storage/items/list/RouteDashGamesManageApiDataStorageItemsList.vue'
		),
};
