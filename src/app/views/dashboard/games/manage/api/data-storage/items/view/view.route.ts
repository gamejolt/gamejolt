import { RouteConfig } from 'vue-router';

export const routeDashGamesManageApiDataStorageItemsView: RouteConfig = {
	name: 'dash.games.manage.api.data-storage.items.view',
	path: 'data-storage/items/:item(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiDataStorageItemsView" */ './view'),
};
