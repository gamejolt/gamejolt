import { RouteRecordRaw } from 'vue-router';

export const routeBadgeFeatured: RouteRecordRaw = {
	path: '/badge/featured/:gameId',
	component: () => import(/* webpackChunkName: "routeBadgeFeatured" */ './featured.vue'),
};
