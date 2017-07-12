import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageDevlog: VueRouter.RouteConfig = {
	name: 'dash.games.manage.devlog',
	path: 'devlog/:tab(active|draft)?',
	props: true,
	component: () => asyncComponentLoader(import('./devlog')),
};
