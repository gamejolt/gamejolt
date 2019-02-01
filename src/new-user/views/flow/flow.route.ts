import { RouteConfig } from 'vue-router';
import { routeFlowAvatar } from './avatar/avatar.route';
import RouteFlow from './flow';

export const routeFlow: RouteConfig = {
	path: '/new-user',
	component: RouteFlow,
	children: [routeFlowAvatar],
};
