import VueRouter from 'vue-router';

export const routeDashAccountAvatar: VueRouter.RouteConfig = {
	name: 'dash.account.avatar',
	path: 'profile/avatar',
	props: true,
	component: () => import('./avatar'),
};
