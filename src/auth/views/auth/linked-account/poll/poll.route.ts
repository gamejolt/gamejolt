import { RouteRecordRaw } from 'vue-router';

export const routeAuthLinkedAccountPoll: RouteRecordRaw = {
	name: 'auth.linked-account.poll',
	path: 'linked-account/poll/:token',
	component: () => import(/* webpackChunkName: "routeAuthLinkedAccountPoll" */ './poll.vue'),
};
