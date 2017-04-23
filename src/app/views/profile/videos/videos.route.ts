import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeProfileVideos: VueRouter.RouteConfig = {
	name: 'profile.videos',
	path: 'videos',
	props: true,
	component: () => asyncComponentLoader( $import( './videos' ) ),
};
