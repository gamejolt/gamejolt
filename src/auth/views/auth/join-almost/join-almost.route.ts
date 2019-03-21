import { RouteConfig } from 'vue-router';

export const routeAuthJoinAlmost: RouteConfig = {
	name: 'auth.join-almost',
	path: 'join/almost',
	component: () => import(/* webpackChunkName: "routeAuthJoinAlmost" */ './join-almost.vue'),
	meta: {
		hideCoverImage: true,
	},
};
