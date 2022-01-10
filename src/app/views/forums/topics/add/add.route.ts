import { RouteRecordRaw } from 'vue-router';

export const routeForumsTopicsAdd: RouteRecordRaw = {
	name: 'forums.topics.add',
	path: '/f/:channel/create',
	component: () => import('./add.vue'),
};
