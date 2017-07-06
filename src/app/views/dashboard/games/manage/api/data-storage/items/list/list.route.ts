import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageApiDataStorageItemsList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.api.data-storage.items.list',
	path: 'data-storage/items',
	props: true,
	component: () => asyncComponentLoader(import('./list')),
};
