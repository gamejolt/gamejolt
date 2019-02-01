import { RouteConfig } from 'vue-router';

export const routeFlowAvatar: RouteConfig = {
	name: 'flow.avatar',
	path: '/',
	component: () => import(/* webpackChunkName: "routeFlowAvatar" */ './avatar'),
};
