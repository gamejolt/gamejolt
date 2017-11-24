import { RouteConfig } from 'vue-router';

export const routeDashAccountEdit: RouteConfig = {
	name: 'dash.account.edit',
	path: 'profile/edit',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountEdit" */ './edit'),
};
