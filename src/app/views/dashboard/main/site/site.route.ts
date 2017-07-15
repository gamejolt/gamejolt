import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { routeDashMainSiteEditor } from './editor/editor.route';

export const routeDashMainSite: VueRouter.RouteConfig = {
	name: 'dash.main.site',
	path: 'site',
	props: true,
	component: () => asyncComponentLoader(import('./site')),
	children: [routeDashMainSiteEditor],
};
