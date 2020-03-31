import { RouteConfig } from 'vue-router';

export const routeDashStickersCollect: RouteConfig = {
	name: 'dash.stickers.collect',
	path: 'collect',
	// Same chunk as parent
	component: () => import(/* webpackChunkName: "routeDashStickers" */ './collect.vue'),
};
