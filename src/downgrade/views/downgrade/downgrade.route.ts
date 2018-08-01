import { RouteConfig } from 'vue-router';
import RouteDowngrade from './downgrade';

export const routeDowngrade: RouteConfig = {
	path: '/',
	props: true,
	component: RouteDowngrade,
};
