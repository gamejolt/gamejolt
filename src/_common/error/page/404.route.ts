import { RouteRecordRaw } from 'vue-router';

import RouteError404 from '~common/error/page/RouteError404.vue';

export const routeError404: RouteRecordRaw = {
	name: 'error.404',
	path: '/:_(.*)',
	component: RouteError404,
};
