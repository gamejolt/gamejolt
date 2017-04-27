import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeAuthLinkedAccountPoll: VueRouter.RouteConfig = {
	name: 'auth.linked-account.poll',
	path: 'linked-account/poll',
	props: true,
	component: () => asyncComponentLoader( $import( './poll' ) ),
};
