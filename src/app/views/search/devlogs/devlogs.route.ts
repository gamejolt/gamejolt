import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeSearchDevlogs: VueRouter.RouteConfig = {
	name: 'search.devlogs',
	path: 'devlogs',
	props: true,
	component: () => asyncComponentLoader( $import( './devlogs' ) ),
};
