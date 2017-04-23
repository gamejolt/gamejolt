import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverChannelsViewDevlogs: VueRouter.RouteConfig = {
	name: 'discover.channels.view.devlogs',
	path: 'devlogs/:section?',
	component: () => asyncComponentLoader( $import( './devlogs' ) ),
};
