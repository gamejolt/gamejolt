import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeSearchUsers: VueRouter.RouteConfig = {
	name: 'search.users',
	path: 'users',
	props: true,
	component: () => asyncComponentLoader( $import( './users' ) ),
};
