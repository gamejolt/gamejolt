import RouteSiteEditor from '~site-editor/views/RouteSiteEditor.vue';
import { initRouter } from '~utils/router';

export function createSiteEditorRouter() {
	return initRouter([
		{
			name: 'editor',
			path: '/site-editor/:tab',
			component: RouteSiteEditor,
		},
	]);
}
