import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiDataStorageItemsView: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.data-storage.items.view',
	path: 'data-storage/items/:item(\\d+)',
	props: true,
	component: () => asyncComponentLoader(import('./view')),
};
