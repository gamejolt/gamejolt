import { RouteConfig } from 'vue-router';
import RouteDowngrade from './downgrade';

export const routeDowngrade: RouteConfig = {
	path: '/downgrade',
	props: true,
	component: RouteDowngrade,
};
