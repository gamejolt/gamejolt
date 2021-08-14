import { RouteRecordRaw } from 'vue-router';

export const routeLandingAdtest: RouteRecordRaw = {
	name: 'landing.adtest',
	path: '/adtest',
	component: () => import(/* webpackChunkName: "routeLandingAdtest" */ './adtest.vue'),
};
