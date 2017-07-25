import VueRouter from 'vue-router';

export const routeDashGamesManageApiDataStorageItemsList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.data-storage.items.list',
	path: 'data-storage/items',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashGamesManageApiDataStorageItemsList" */ './list'),
};
