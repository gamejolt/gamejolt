import VueRouter from 'vue-router';

import { routeDashMainSiteEditor } from './editor/editor.route';

export const routeDashMainSite: VueRouter.RouteConfig = {
	name: 'dash.main.site',
	path: 'site',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashMainSite" */ './site'),
	children: [routeDashMainSiteEditor],
};
