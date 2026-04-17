import { RouteRecordRaw } from 'vue-router';

import RouteSiteEditor from '~site-editor/views/RouteSiteEditor.vue';
import { initRouter } from '~utils/router';

const routes: RouteRecordRaw[] = [
	{
		name: 'editor',
		path: '/site-editor/:tab',
		component: RouteSiteEditor,
	},
];

export const router = initRouter(routes);
