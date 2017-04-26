import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeRetrieve: VueRouter.RouteConfig = {
	name: 'retrieve',
	path: '/claim/:input([gb]{1}\\-[0-9a-zA-Z]+)?',
	props: true,
	component: () => asyncComponentLoader( $import( './retrieve' ) ),
};
