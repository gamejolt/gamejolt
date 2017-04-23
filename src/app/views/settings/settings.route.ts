import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeSettings: VueRouter.RouteConfig = {
	name: 'settings',
	path: '/settings',
	props: true,
	component: () => asyncComponentLoader( $import( './settings' ) ),
	meta: {
		availableOffline: true,
	},
};
