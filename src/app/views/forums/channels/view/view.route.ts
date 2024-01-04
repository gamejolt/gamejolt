import { RouteRecordRaw } from 'vue-router';

export const routeForumsChannelsView: RouteRecordRaw = {
	name: 'forums.channels.view',
	path: '/f/:name/:sort(active|new|top|archived)?',
	component: () => import('./RouteForumsChannelsView.vue'),
};
