import { RouteRecordRaw } from 'vue-router';
import RouteError404 from './RouteError404.vue';

export const routeError404: RouteRecordRaw = {
	name: 'error.404',
	path: '/:_(.*)',
	component: RouteError404,
};
