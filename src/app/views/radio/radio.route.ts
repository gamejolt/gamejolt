import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeRadio: VueRouter.RouteConfig = {
	name: 'radio',
	path: '/radio',
	component: () => asyncComponentLoader( $import( './radio' ) ),
};
