import { RouteConfig } from 'vue-router';
import RouteUpgrade from './upgrade';

export const routeUpgrade: RouteConfig = {
	path: '/upgrade',
	props: true,
	component: RouteUpgrade,
};
