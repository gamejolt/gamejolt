import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeAuthLinkedAccountTwitterFinalize: VueRouter.RouteConfig = {
	name: 'auth.linked-account.twitter.finalize',
	path: 'twitter/finalize/:state',
	props: true,
	component: () => asyncComponentLoader( $import( './finalize' ) ),
};
