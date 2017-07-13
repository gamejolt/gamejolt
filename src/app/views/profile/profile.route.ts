import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeProfileOverview } from './overview/overview.route';
import { routeProfileVideos } from './videos/videos.route';
import { routeProfileLibrary } from './library/library.route';

export const routeProfile: VueRouter.RouteConfig = {
	name: 'profile',
	path: '/@:username',
	props: true,
	component: () => asyncComponentLoader(import('./profile')),
	children: [routeProfileOverview, routeProfileLibrary, routeProfileVideos],
};
