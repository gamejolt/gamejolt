import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export const routeKey: VueRouter.RouteConfig = {
	name: 'key',
	path: '/claim/:accessKey([a-zA-Z0-9]+)/:bundleGameId(\\d+)?',
	props: true,
	component: () => asyncComponentLoader(import('./key')),
};
