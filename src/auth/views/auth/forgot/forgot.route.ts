import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeAuthForgot: VueRouter.RouteConfig = {
	name: 'auth.forgot',
	path: 'forgot',
	component: () => asyncComponentLoader( $import( './forgot' ) ),
	meta: {
		hideCoverImage: true,
	},
};
