import { RouteRecordRaw } from 'vue-router';

export const routeStyleguide: RouteRecordRaw = {
	name: 'styleguide',
	path: '/styleguide',
	component: () => import(/* webpackChunkName: "routeStyleguide" */ './styleguide.vue'),
};
