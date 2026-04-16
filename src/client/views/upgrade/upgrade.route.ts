import { RouteRecordRaw } from 'vue-router';

import RouteUpgrade from '~client/views/upgrade/RouteUpgrade.vue';

export const routeUpgrade: RouteRecordRaw = {
	path: '/upgrade',
	component: RouteUpgrade,
};
