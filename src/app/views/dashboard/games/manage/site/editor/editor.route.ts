import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageSiteEditor: VueRouter.RouteConfig = {
	name: 'dash.games.manage.site.editor',
	path: 'editor/:tab(theme|content)',
	props: true,
	component: () => asyncComponentLoader(import('./editor')),
};
