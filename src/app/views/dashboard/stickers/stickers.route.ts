import { RouteConfig } from 'vue-router';

export const routeDashStickers: RouteConfig = {
	name: 'dash.stickers',
	path: 'stickers',
	component: () => import(/* webpackChunkName: "routeDashStickers" */ './stickers.vue'),
};
