import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashAccountEdit: VueRouter.RouteConfig = {
	name: 'dash.account.edit',
	path: 'profile/edit',
	props: true,
	component: () => asyncComponentLoader( $import( './edit' ) ),
};
