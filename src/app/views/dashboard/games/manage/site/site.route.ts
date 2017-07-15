import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';
import { routeDashGamesManageSiteEditor } from './editor/editor.route';

export const routeDashGamesManageSite: VueRouter.RouteConfig = {
	name: 'dash.games.manage.site',
	path: 'site',
	props: true,
	component: () => asyncComponentLoader(import('./site')),
	children: [routeDashGamesManageSiteEditor],
};
