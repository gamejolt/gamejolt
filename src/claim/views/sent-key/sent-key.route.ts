import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeSentKey: VueRouter.RouteConfig = {
	name: 'sent-key',
	path: '/claim/sent',
	props: true,
	component: () => asyncComponentLoader( $import( './sent-key' ) ),
};
