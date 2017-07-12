import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageKeyGroupsEdit: VueRouter.RouteConfig = {
	name: 'dash.games.manage.key-groups.edit',
	path: 'keys/edit/:keyGroupId(\\d+)',
	props: true,
	component: () => asyncComponentLoader(import('./edit')),
};
