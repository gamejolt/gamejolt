import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeTest: VueRouter.RouteConfig[] = [
	{
		name: 'test',
		path: '/test',
		component: () => asyncComponentLoader( $import( './test' ) ),
	},
	{
		name: 'test-other',
		path: '/test-other',
		component: () => asyncComponentLoader( $import( './test-other' ) ),
	},
];
