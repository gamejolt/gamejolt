import { RouteConfig } from 'vue-router';

export const routeBadgeFeatured: RouteConfig = {
	path: '/badge/featured/:gameId',
	component: () => import(/* webpackChunkName: "routeBadgeFeatured" */ './featured.vue'),
};
