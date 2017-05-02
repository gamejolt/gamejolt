import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeAuthResetPassword: VueRouter.RouteConfig = {
	name: 'auth.reset-password',
	path: 'reset-password/:userId/:token',
	props: true,
	component: () => asyncComponentLoader( $import( './reset-password' ) ),
	meta: {
		hideCoverImage: true,
	},
};
