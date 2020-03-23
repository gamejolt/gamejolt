import { RouteConfig } from 'vue-router';

export const routeDashStickersCollect: RouteConfig = {
	name: 'dash.stickers.collect',
	path: 'collect',
	component: () => import(/* webpackChunkName: "routeDashStickersCollect" */ './collect.vue'),
};
