import { RouteRecordRaw } from 'vue-router';
import { initRouter } from '../../utils/router';
import RouteSiteEditor from './RouteSiteEditor.vue';

const routes: RouteRecordRaw[] = [
	{
		name: 'editor',
		path: '/site-editor/:tab',
		component: RouteSiteEditor,
	},
];

export const router = initRouter(routes);
