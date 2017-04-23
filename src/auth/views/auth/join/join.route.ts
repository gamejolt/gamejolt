import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeAuthJoin: VueRouter.RouteConfig = {
	name: 'auth.join',
	path: 'join',
	props: true,
	component: () => asyncComponentLoader( $import( './join' ) ),
};
