import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashMainSiteEditor: VueRouter.RouteConfig = {
	name: 'dash.main.site.editor',
	path: 'editor/:tab(theme|content)',
	props: true,
	component: () => asyncComponentLoader(import('./editor')),
};
