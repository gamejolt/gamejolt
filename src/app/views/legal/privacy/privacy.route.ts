import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeLegalPrivacy: VueRouter.RouteConfig = {
	name: 'legal.privacy',
	path: '/privacy',
	component: () => asyncComponentLoader( $import( './privacy' ) ),
};
