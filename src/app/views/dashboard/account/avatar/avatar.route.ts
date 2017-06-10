import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountAvatar: VueRouter.RouteConfig = {
	name: 'dash.account.avatar',
	path: 'profile/avatar',
	props: true,
	component: () => asyncComponentLoader( $import( './avatar' ) ),
};
