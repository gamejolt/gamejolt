import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeForumsTopicsView: VueRouter.RouteConfig = {
	name: 'forums.topics.view',
	path: '/f/:slug/:id(\\d+)',
	component: () => asyncComponentLoader( $import( './view' ) ),
};
