import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeAuthLogin: VueRouter.RouteConfig = {
	name: 'auth.login',
	path: 'login',
	props: true,
	component: () => asyncComponentLoader( $import( './login' ) ),
};
