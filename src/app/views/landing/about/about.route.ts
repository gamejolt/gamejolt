import { RouteRecordRaw } from 'vue-router';

export const routeLandingAbout: RouteRecordRaw = {
	name: 'landing.about',
	path: '/about',
	component: () => import(/* webpackChunkName: "routeLandingAbout" */ './about.vue'),
};
