import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageKeyGroupsList: VueRouter.RouteConfig = {
	name: 'dash.games.manage.key-groups.list',
	path: 'keys',
	props: true,
	component: () => asyncComponentLoader(import('./list')),
};
