import VueRouter from 'vue-router';

export const routeDashAccountEdit: VueRouter.RouteConfig = {
	name: 'dash.account.edit',
	path: 'profile/edit',
	props: true,
	component: () => import('./edit'),
};
