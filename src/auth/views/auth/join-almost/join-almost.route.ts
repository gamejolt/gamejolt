import { RouteConfig } from 'vue-router';

export const routeAuthJoinAlmost: RouteConfig = {
	name: 'auth.join-almost',
	path: 'join/almost',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthJoinAlmost" */ './join-almost'),
	meta: {
		hideCoverImage: true,
	},
};
