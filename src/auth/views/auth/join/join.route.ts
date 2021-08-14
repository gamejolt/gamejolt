import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoin: RouteRecordRaw = {
	name: 'auth.join',
	path: '/join',
	component: () => import(/* webpackChunkName: "routeAuthJoin" */ './join.vue'),
};
