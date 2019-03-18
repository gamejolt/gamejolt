import { RouteConfig } from 'vue-router';

export const routeDashAccountEdit: RouteConfig = {
	name: 'dash.account.edit',
	path: 'profile/edit',
	component: () => import(/* webpackChunkName: "routeDashAccountEdit" */ './edit.vue'),
};
