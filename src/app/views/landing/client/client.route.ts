import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeLandingClient: VueRouter.RouteConfig = {
	name: 'landing.client',
	path: '/client',
	component: () => asyncComponentLoader( $import( './client' ) ),
};
