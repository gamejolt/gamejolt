import { RouteRecordRaw } from 'vue-router';

export const routeSentKey: RouteRecordRaw = {
	name: 'sent-key',
	path: '/claim/sent',
	component: () => import('~claim/views/sent-key/RouteSentKey.vue'),
};
