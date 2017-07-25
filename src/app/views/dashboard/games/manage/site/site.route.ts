import VueRouter from 'vue-router';

import { routeDashGamesManageSiteEditor } from './editor/editor.route';

export const routeDashGamesManageSite: VueRouter.RouteConfig = {
	name: 'dash.games.manage.site',
	path: 'site',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageSite" */ './site'),
	children: [routeDashGamesManageSiteEditor],
};
